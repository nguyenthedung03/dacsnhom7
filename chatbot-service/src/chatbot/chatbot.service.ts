import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatHistory, ChatHistoryDocument } from '../schemas/chat-history.schema';

export interface ChatContext {
  comics?: any[];
  orders?: any[];
  userId?: string;
  userEmail?: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectModel(ChatHistory.name)
    private chatHistoryModel: Model<ChatHistoryDocument>,
  ) {}

  async chat(sessionId: string, userMessage: string, context: ChatContext = {}) {
    const { comics = [], orders = [], userId, userEmail } = context;

    // Save user message to DB
    await this.chatHistoryModel.create({
      sessionId,
      userId: userId || 'anonymous',
      userEmail: userEmail || '',
      role: 'user',
      content: userMessage,
    });

    // Detect intent
    const intent = this.detectIntent(userMessage, comics, orders);

    const comicList =
      comics.length > 0
        ? comics
            .slice(0, 40)
            .map(
              (c) =>
                `- ${c.title} (${c.author}) | Thể loại: ${(c.genres || []).join(', ')} | ${c.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang tiến hành'} | Giá: ${(c.price || 29000).toLocaleString('vi-VN')}đ | Tồn kho: ${c.stock ?? 'N/A'} | Rating: ${c.rating ?? 'N/A'}⭐`,
            )
            .join('\n')
        : 'Chưa có dữ liệu truyện.';

    const orderList =
      orders.length > 0
        ? orders
            .map(
              (o) =>
                `- Mã đơn: ${o.paymentRef || o._id} | Trạng thái: ${this.translateStatus(o.status)} | Tổng: ${(o.totalAmount || 0).toLocaleString('vi-VN')}đ | Ngày: ${new Date(o.createdAt).toLocaleDateString('vi-VN')}`,
            )
            .join('\n')
        : 'Chưa có đơn hàng.';

    const userContext = userId
      ? `Người dùng hiện tại: ${userEmail || userId} (đã đăng nhập)`
      : 'Người dùng chưa đăng nhập';

    const systemInstruction = `Bạn là trợ lý AI thông minh của cửa hàng truyện tranh "ComicVerse". Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp và ngắn gọn.

${userContext}

DANH SÁCH TRUYỆN (${comics.length} cuốn):
${comicList}

ĐƠN HÀNG CỦA NGƯỜI DÙNG:
${orderList}

CHÍNH SÁCH CỬA HÀNG:
- Thanh toán: COD, MoMo, VNPay, Chuyển khoản ngân hàng
- Giao hàng: 2-5 ngày làm việc, miễn ship đơn trên 200.000đ
- Đổi trả: 7 ngày nếu sản phẩm lỗi
- Hotline: 1900-26642
- Email hỗ trợ: support@comicverse.vn

KHẢ NĂNG CỦA BẠN:
1. Tìm kiếm truyện theo tên, tác giả, thể loại, giá cả
2. Gợi ý truyện phù hợp theo sở thích người dùng
3. Kiểm tra trạng thái đơn hàng
4. Giải đáp thắc mắc về chính sách
5. So sánh truyện và tư vấn mua hàng
6. Thông tin về tồn kho, rating

Khi gợi ý sản phẩm: Luôn nêu rõ tên, giá, thể loại và lý do gợi ý.
Khi kiểm tra đơn hàng: Nêu đầy đủ mã đơn, trạng thái, tổng tiền, ngày đặt.
Format đẹp với emoji phù hợp. Dùng danh sách khi liệt kê nhiều mục.`;

    // Get recent history from DB
    const historyDocs = await this.chatHistoryModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const history = historyDocs.reverse();

    // Build Gemini contents
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const m of history) {
      const geminiRole = m.role === 'user' ? 'user' : 'model';
      const last = contents[contents.length - 1];
      if (last && last.role === geminiRole) {
        last.parts[0].text += '\n' + m.content;
      } else {
        contents.push({ role: geminiRole, parts: [{ text: m.content }] });
      }
    }
    while (contents.length > 0 && contents[0].role !== 'user') contents.shift();

    const apiKey = process.env.GEMINI_API_KEY;
    let reply = '';

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
            }),
          },
        );
        const data: any = await res.json();
        if (res.ok) {
          reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          this.logger.error('Gemini error: ' + JSON.stringify(data).slice(0, 200));
        }
      } catch (e) {
        this.logger.error('Gemini fetch error: ' + e);
      }
    }

    if (!reply) reply = this.ruleBased(userMessage, intent, comics, orders);

    // Save assistant reply to DB
    await this.chatHistoryModel.create({
      sessionId,
      userId: userId || 'anonymous',
      userEmail: userEmail || '',
      role: 'assistant',
      content: reply,
    });

    return { message: reply, sessionId, intent };
  }

  // ── Intent detection ──────────────────────────────────────────────────────
  private detectIntent(msg: string, comics: any[], orders: any[]): string {
    const q = this.normalize(msg);
    if (/xin chao|chao ban|hello|hi |hey|alo/.test(q)) return 'greeting';
    if (/kiem tra don|don hang|trang thai don|ma don|order/.test(q)) return 'order_status';
    if (/goi y|de xuat|hay nhat|nen mua|nen doc|phu hop/.test(q)) return 'recommend';
    if (/tim|search|co truyen|co sach/.test(q)) return 'search';
    if (/gia|bao nhieu tien|chi phi|mua|thanh toan|dat hang/.test(q)) return 'purchase';
    if (/ship|giao hang|van chuyen/.test(q)) return 'shipping';
    if (/doi tra|hoan tien|bao hanh/.test(q)) return 'return';
    if (/the loai|action|romance|fantasy|shounen|seinen/.test(q)) return 'genre';
    if (/so sanh|khac nhau|chon|hay hon/.test(q)) return 'compare';
    return 'general';
  }

  // ── Rule-based fallback ──────────────────────────────────────────────────
  private ruleBased(msg: string, intent: string, comics: any[], orders: any[]): string {
    const q = this.normalize(msg);

    if (intent === 'greeting')
      return '👋 Xin chào! Tôi là trợ lý AI ComicVerse. Tôi có thể giúp bạn:\n• 🔍 Tìm & gợi ý truyện\n• 📦 Kiểm tra đơn hàng\n• 💳 Tư vấn thanh toán\n• 🔄 Chính sách đổi trả\nBạn cần hỗ trợ gì ạ?';

    if (intent === 'order_status') {
      if (orders.length === 0)
        return '📦 Bạn chưa có đơn hàng nào. Hãy khám phá kho truyện và đặt hàng nhé!';
      const list = orders
        .slice(0, 5)
        .map(
          (o) =>
            `📋 Mã: **${o.paymentRef || o._id?.slice(-8)}**\n   └ ${this.translateStatus(o.status)} | ${(o.totalAmount || 0).toLocaleString('vi-VN')}đ | ${new Date(o.createdAt).toLocaleDateString('vi-VN')}`,
        )
        .join('\n\n');
      return `📦 Đơn hàng của bạn:\n\n${list}`;
    }

    if (intent === 'recommend') {
      if (comics.length === 0) return '📚 Kho truyện đang cập nhật. Vui lòng quay lại sau!';
      const topRated = [...comics].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
      return `⭐ Top truyện được yêu thích nhất:\n${topRated.map((c, i) => `${i + 1}. **${c.title}** - ${c.author}\n   💰 ${(c.price || 29000).toLocaleString('vi-VN')}đ | ⭐ ${c.rating ?? '4.5'} | ${(c.genres || []).join(', ')}`).join('\n\n')}`;
    }

    if (intent === 'genre') {
      const genreMap: Record<string, string[]> = {
        action: ['action', 'hành động'],
        romance: ['romance', 'tình cảm', 'lãng mạn'],
        fantasy: ['fantasy', 'kỳ ảo', 'phép thuật'],
        shounen: ['shounen', 'thiếu niên'],
        seinen: ['seinen', 'trưởng thành'],
      };
      for (const [key, aliases] of Object.entries(genreMap)) {
        if (aliases.some((a) => q.includes(a))) {
          const found = comics.filter((c) =>
            (c.genres || []).some((g: string) => g.toLowerCase().includes(key)),
          ).slice(0, 4);
          if (found.length > 0)
            return `📚 Truyện thể loại ${key}:\n${found.map((c) => `• **${c.title}** - ${(c.price || 29000).toLocaleString('vi-VN')}đ`).join('\n')}`;
        }
      }
    }

    if (intent === 'shipping')
      return '🚚 **Thông tin giao hàng:**\n• Thời gian: 2-5 ngày làm việc\n• Phí ship: 30.000đ\n• ✨ Miễn phí ship đơn từ **200.000đ**\n• Giao toàn quốc 63 tỉnh thành';

    if (intent === 'return')
      return '🔄 **Chính sách đổi trả:**\n• Thời hạn: 7 ngày kể từ ngày nhận hàng\n• Điều kiện: Sản phẩm lỗi, hư hỏng do vận chuyển\n• Hotline: **1900-26642**\n• Email: support@comicverse.vn';

    if (intent === 'purchase')
      return '💳 **Phương thức thanh toán:**\n• 💵 Tiền mặt khi nhận hàng (COD)\n• 📱 Ví MoMo\n• 💳 VNPay\n• 🏦 Chuyển khoản ngân hàng\n\nĐơn từ 200.000đ được miễn phí giao hàng!';

    // Search by keyword
    const found = comics
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(msg.toLowerCase()) ||
          c.author?.toLowerCase().includes(msg.toLowerCase()),
      )
      .slice(0, 4);
    if (found.length > 0)
      return `🔍 Kết quả tìm kiếm:\n${found.map((c) => `• **${c.title}** - ${c.author}\n  💰 ${(c.price || 29000).toLocaleString('vi-VN')}đ | ${(c.genres || []).join(', ')}`).join('\n\n')}`;

    return '🤔 Tôi có thể giúp bạn:\n• 🔍 **Tìm truyện** - nhập tên hoặc tác giả\n• ⭐ **Gợi ý** - "Gợi ý truyện hay"\n• 📦 **Đơn hàng** - "Kiểm tra đơn hàng"\n• 💳 **Thanh toán** - "Cách thanh toán"\n• 🚚 **Giao hàng** - "Chính sách ship"';
  }

  private normalize(msg: string): string {
    return msg
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING: '⏳ Chờ xác nhận',
      PAID: '✅ Đã thanh toán',
      DELIVERED: '📬 Đã giao hàng',
      CANCELLED: '❌ Đã hủy',
    };
    return map[status] || status;
  }

  // ── History methods ──────────────────────────────────────────────────────
  async getHistory(sessionId: string) {
    return this.chatHistoryModel.find({ sessionId }).sort({ createdAt: 1 }).lean();
  }

  async getUserHistory(userId: string) {
    // Get all sessions for this user
    const sessions = await this.chatHistoryModel
      .distinct('sessionId', { userId })
      .lean();
    
    const result: any[] = [];
    for (const sid of sessions.slice(0, 10)) {
      const msgs = await this.chatHistoryModel
        .find({ sessionId: sid, userId })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean<any[]>();
      if (msgs.length > 0) {
        result.push({
          sessionId: sid,
          messages: msgs,
          lastMessage: msgs[msgs.length - 1].createdAt,
          preview: msgs.find((m) => m.role === 'user')?.content?.slice(0, 50) || '',
        });
      }
    }
    return result.sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime());
  }

  async clearHistory(sessionId: string) {
    await this.chatHistoryModel.deleteMany({ sessionId });
    return { message: 'Đã xóa lịch sử chat', sessionId };
  }

  async clearUserHistory(userId: string) {
    const result = await this.chatHistoryModel.deleteMany({ userId });
    return { message: `Đã xóa ${result.deletedCount} tin nhắn`, userId };
  }

  async searchProducts(query: string, comics: any[]) {
    const q = query.toLowerCase();
    const results = comics.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.author?.toLowerCase().includes(q) ||
        (c.genres || []).some((g: string) => g.toLowerCase().includes(q)) ||
        c.description?.toLowerCase().includes(q),
    );

    // Sort by relevance: title match first, then author, then genre
    results.sort((a, b) => {
      const aTitle = a.title?.toLowerCase().includes(q) ? 2 : 0;
      const bTitle = b.title?.toLowerCase().includes(q) ? 2 : 0;
      const aAuthor = a.author?.toLowerCase().includes(q) ? 1 : 0;
      const bAuthor = b.author?.toLowerCase().includes(q) ? 1 : 0;
      return bTitle + bAuthor - (aTitle + aAuthor);
    });

    return results.slice(0, 8);
  }

  async getSuggestions(preferences: {
    genres?: string[];
    priceRange?: [number, number];
    status?: string;
  }, comics: any[]) {
    let results = [...comics];

    if (preferences.genres && preferences.genres.length > 0) {
      results = results.filter((c) =>
        (c.genres || []).some((g: string) =>
          preferences.genres!.some((pg) => g.toLowerCase().includes(pg.toLowerCase())),
        ),
      );
    }

    if (preferences.priceRange) {
      const [min, max] = preferences.priceRange;
      results = results.filter((c) => {
        const price = c.price || 29000;
        return price >= min && price <= max;
      });
    }

    if (preferences.status) {
      results = results.filter((c) => c.status === preferences.status);
    }

    // Sort by rating then purchaseCount
    results.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.purchaseCount || 0) - (a.purchaseCount || 0);
    });

    return results.slice(0, 6);
  }
}
