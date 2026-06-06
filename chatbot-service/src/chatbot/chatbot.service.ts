import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  private sessions = new Map<string, { role: 'user' | 'assistant'; content: string }[]>();

  async chat(sessionId: string, userMessage: string, comicsContext?: any[]) {
    if (!this.sessions.has(sessionId)) this.sessions.set(sessionId, []);
    const history = this.sessions.get(sessionId)!;
    history.push({ role: 'user', content: userMessage });

    const comicList = comicsContext && comicsContext.length > 0
      ? comicsContext.slice(0, 30).map(c =>
          `- ${c.title} (${c.author}) | Thể loại: ${(c.genres || []).join(', ')} | ${c.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang tiến hành'} | Giá: ${(c.price || 29000).toLocaleString('vi-VN')}đ`
        ).join('\n')
      : 'Chưa có dữ liệu truyện.';

    const systemInstruction = `Bạn là trợ lý AI của cửa hàng truyện tranh "ComicVerse". Trả lời bằng tiếng Việt, thân thiện, ngắn gọn.

Truyện đang có:
${comicList}

Chính sách cửa hàng:
- Thanh toán: COD, MoMo, VNPay, Chuyển khoản ngân hàng
- Giao hàng: 2-5 ngày làm việc, miễn ship đơn trên 200.000đ
- Đổi trả: 7 ngày nếu sản phẩm lỗi
- Hotline: 1900-26642`;

    // Build Gemini contents (user/model alternating)
    const recentHistory = history.slice(-20);
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const m of recentHistory) {
      const geminiRole = m.role === 'user' ? 'user' : 'model';
      const last = contents[contents.length - 1];
      if (last && last.role === geminiRole) {
        last.parts[0].text += '\n' + m.content;
      } else {
        contents.push({ role: geminiRole, parts: [{ text: m.content }] });
      }
    }
    // Must start with user
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
              generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
            }),
          }
        );
        const data: any = await res.json();
        console.log('[Chatbot] Gemini status:', res.status, data?.error?.message || 'OK');
        if (res.ok) {
          reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          console.error('[Chatbot] Gemini error:', JSON.stringify(data).slice(0, 300));
        }
      } catch (e) {
        console.error('[Chatbot] fetch error:', e);
      }
    }

    if (!reply) reply = this.ruleBased(userMessage, comicsContext || []);

    history.push({ role: 'assistant', content: reply });
    return { message: reply, sessionId };
  }

  private ruleBased(msg: string, comics: any[]): string {
    const q = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

    if (/^(xin chao|chao|hello|hi|hey|alo)/.test(q))
      return '👋 Xin chào! Tôi là trợ lý ComicVerse. Tôi có thể giúp bạn tìm truyện, tư vấn mua hàng và giải đáp thắc mắc. Bạn cần gì ạ?';

    if (/thanh toan|chuyen khoan|momo|vnpay|cod|tien mat/.test(q))
      return '💳 ComicVerse hỗ trợ:\n• 💵 Tiền mặt khi nhận hàng (COD)\n• 📱 Ví MoMo\n• 💳 VNPay\n• 🏦 Chuyển khoản ngân hàng';

    if (/giao hang|ship|van chuyen|phi ship/.test(q))
      return '🚚 Giao toàn quốc 2-5 ngày. Miễn phí ship đơn từ 200.000đ!';

    if (/doi tra|hoan tra|chinh sach/.test(q))
      return '🔄 Đổi trả trong 7 ngày nếu sản phẩm lỗi. Hotline: 1900-26642';

    if (/goi y|de xuat|hay|hot/.test(q)) {
      if (comics.length === 0) return '📚 Kho truyện đang cập nhật. Vui lòng quay lại sau!';
      const picks = comics.slice(0, 4);
      return `📚 Gợi ý truyện hay:\n${picks.map(c => `• ${c.title} - ${(c.price || 29000).toLocaleString('vi-VN')}đ`).join('\n')}`;
    }

    const found = comics.filter(c =>
      c.title?.toLowerCase().includes(msg.toLowerCase()) ||
      c.author?.toLowerCase().includes(msg.toLowerCase())
    ).slice(0, 3);
    if (found.length > 0)
      return `🔍 Tìm thấy:\n${found.map(c => `• ${c.title} - ${c.author} | ${(c.price || 29000).toLocaleString('vi-VN')}đ`).join('\n')}`;

    return '🤔 Bạn có thể hỏi tôi về: gợi ý truyện, giá cả, thanh toán, giao hàng, hoặc tìm truyện theo tên/tác giả nhé!';
  }

  async getHistory(sessionId: string) {
    return (this.sessions.get(sessionId) || []).map((m, i) => ({ _id: String(i), sessionId, ...m }));
  }

  async clearHistory(sessionId: string) {
    this.sessions.delete(sessionId);
    return { message: 'Cleared' };
  }
}
