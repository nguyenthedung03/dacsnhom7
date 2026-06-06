// frontend/src/App.tsx
// THAY THẾ TOÀN BỘ NỘI DUNG FILE NÀY

import { useEffect, useState, useRef } from 'react';
import './App.css';

// ===================== TYPES =====================
type Comic = {
  _id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverImage: string;
  status: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  purchaseCount: number;
};

type Chapter = {
  _id: string;
  comicId: string;
  title: string;
  chapterNumber: number;
  images: string[];
};

type CartItem = {
  comic: Comic;
  quantity: number;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Order = {
  _id: string;
  paymentRef: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: string;
  message?: string;
};

// ===================== APP =====================
function App() {
  const apiHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
  const apiBase = `http://${apiHost}:3000/api`;

  const getImageUrl = (url: string) => {
    if (!url) return `https://picsum.photos/seed/${Math.random()}/300/400`;
    if (url.includes('localhost')) return url.replace('localhost', apiHost);
    return url;
  };

  // ---- VIEW STATE ----
  const [view, setView] = useState<'public' | 'login' | 'register' | 'admin' | 'cart' | 'checkout' | 'orders' | 'comicDetail'>(
    localStorage.getItem('token') ? 'admin' : 'public'
  );

  // ---- AUTH ----
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ---- COMICS ----
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [filterGenre, setFilterGenre] = useState('');

  // ---- CART ----
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // ---- CHECKOUT ----
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checkoutNote, setCheckoutNote] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // ---- ORDERS ----
  const [orders, setOrders] = useState<Order[]>([]);

  // ---- CHATBOT ----
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '👋 Xin chào! Tôi là trợ lý AI của ComicVerse. Tôi có thể giúp bạn tìm truyện, tư vấn mua hàng và giải đáp thắc mắc. Bạn cần hỗ trợ gì?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ---- MODAL ----
  type ModalType = 'success' | 'error' | 'info' | 'confirm' | 'order';
  const [modal, setModal] = useState<{
    open: boolean; type: ModalType; title: string; message: string;
    detail?: string; onConfirm?: () => void;
  }>({ open: false, type: 'info', title: '', message: '' });
  const showModal = (type: ModalType, title: string, message: string, detail?: string, onConfirm?: () => void) =>
    setModal({ open: true, type, title, message, detail, onConfirm });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  // ---- ADMIN ----
  const [selectedAdminComic, setSelectedAdminComic] = useState<Comic | null>(null);
  const [showAddComicForm, setShowAddComicForm] = useState(false);
  const [showAddChapterForm, setShowAddChapterForm] = useState(false);
  const [showEditComicForm, setShowEditComicForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [pricingComic, setPricingComic] = useState<Comic | null>(null);
  const [newPrice, setNewPrice] = useState(29000);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [status, setStatus] = useState('ONGOING');
  const [price, setPrice] = useState(29000);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterImages, setChapterImages] = useState<File[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  // ---- TOP COMICS ----
  const [topComics, setTopComics] = useState<Comic[]>([]);

  // ---- REVIEW ----
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewComicId, setReviewComicId] = useState<string | null>(null);
  const [reviewComicTitle, setReviewComicTitle] = useState('');
  const [reviewStar, setReviewStar] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('reviewedOrders') || '[]')); }
    catch { return new Set(); }
  });

  // ===================== EFFECTS =====================
  useEffect(() => { fetchComics(); fetchTopComics(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // ===================== FETCH COMICS =====================
  const fetchComics = async () => {
    try {
      setLoading(true);
      const url = keyword
        ? `${apiBase}/search?keyword=${encodeURIComponent(keyword)}`
        : `${apiBase}/comics`;
      const res = await fetch(url);
      const data = await res.json();
      setComics(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (comicId: string) => {
    try {
      const res = await fetch(`${apiBase}/chapters?comicId=${comicId}`);
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch { setChapters([]); }
  };

  // ===================== TOP COMICS =====================
  const fetchTopComics = async () => {
    try {
      const res = await fetch(`${apiBase}/comics/top`);
      const data = await res.json();
      setTopComics(Array.isArray(data.topByPurchase) ? data.topByPurchase : []);
    } catch { setTopComics([]); }
  };

  // ===================== REVIEW =====================
  const openReviewModal = (orderId: string, comicId: string, comicTitle: string) => {
    setReviewOrderId(orderId);
    setReviewComicId(comicId);
    setReviewComicTitle(comicTitle);
    setReviewStar(0);
    setReviewHover(0);
  };

  const submitReview = async () => {
    if (!reviewComicId || reviewStar === 0) return;
    try {
      const res = await fetch(`${apiBase}/comics/${reviewComicId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ star: reviewStar }),
      });
      const data = await res.json();
      console.log('[Review response]', res.status, data);
      if (!res.ok) {
        showModal('error', 'Lỗi đánh giá', `Server trả về: ${data.message || res.status}`);
        return;
      }
      const newReviewed = new Set(reviewedOrders);
      newReviewed.add(`${reviewOrderId}_${reviewComicId}`);
      setReviewedOrders(newReviewed);
      localStorage.setItem('reviewedOrders', JSON.stringify([...newReviewed]));
      setReviewOrderId(null);
      setReviewComicId(null);
      showModal('success', 'Cảm ơn bạn! ⭐', `Bạn đã đánh giá ${reviewStar} sao cho "${reviewComicTitle}"`);
      // Đợi 500ms để backend cập nhật xong rồi refresh
      setTimeout(() => { fetchTopComics(); fetchComics(); }, 500);
    } catch {
      showModal('error', 'Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại!');
    }
  };

  // ===================== AUTH =====================
  const handleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        const decoded: any = JSON.parse(atob(data.accessToken.split('.')[1]));
        setUserEmail(decoded.email || email);
        setUserId(decoded.sub || decoded.userId || '');
        localStorage.setItem('userEmail', decoded.email || email);
        localStorage.setItem('userId', decoded.sub || decoded.userId || '');
        setEmail(''); setPassword('');
        setView(decoded.role === 'ADMIN' ? 'admin' : 'public');
      } else {
        setAuthError(data.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch { setAuthError('Lỗi kết nối server. Vui lòng thử lại!'); }
    finally { setAuthLoading(false); }
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!regUsername.trim()) { setAuthError('Vui lòng nhập tên người dùng'); return; }
    if (!regEmail.trim()) { setAuthError('Vui lòng nhập email'); return; }
    if (regPassword.length < 6) { setAuthError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    if (regPassword !== regConfirm) { setAuthError('Mật khẩu xác nhận không khớp'); return; }
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (res.ok && (data._id || data.id || data.email || data.user)) {
        setAuthSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
        setTimeout(() => { setAuthSuccess(''); setAuthError(''); setView('login'); }, 1500);
      } else {
        setAuthError(data.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      }
    } catch { setAuthError('Lỗi kết nối server. Vui lòng thử lại!'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    setToken('');
    setUserEmail('');
    setUserId('');
    localStorage.clear();
    setView('public');
  };

  // ===================== CART =====================
  const addToCart = (comic: Comic) => {
    setCart(prev => {
      const existing = prev.find(i => i.comic._id === comic._id);
      if (existing) return prev.map(i => i.comic._id === comic._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { comic, quantity: 1 }];
    });
  };

  const removeFromCart = (comicId: string) => setCart(prev => prev.filter(i => i.comic._id !== comicId));
  const updateQty = (comicId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(comicId);
    setCart(prev => prev.map(i => i.comic._id === comicId ? { ...i, quantity: qty } : i));
  };
  const cartTotal = cart.reduce((sum, i) => sum + i.comic.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ===================== CHECKOUT =====================
  const handleCheckout = async () => {
    if (!token) { setView('login'); return; }
    if (!shippingAddress.trim()) { showModal('error', 'Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng'); return; }

    try {
      const res = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId,
          userEmail,
          items: cart.map(i => ({ comicId: i.comic._id, title: i.comic.title, price: i.comic.price, quantity: i.quantity })),
          paymentMethod,
          shippingAddress,
          note: checkoutNote,
        }),
      });
      const data = await res.json();
      if (data.orderId) {
        setLastOrder(data);
        setCart([]);
        setView('orders');
        showModal('order', 'Đặt hàng thành công! 🎉', data.message || 'Đơn hàng của bạn đã được ghi nhận.', data.paymentRef ? `Mã đơn hàng: ${data.paymentRef}` : undefined);
        fetchOrders();
      } else {
        showModal('error', 'Đặt hàng thất bại', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    } catch { showModal('error', 'Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng thử lại!'); }
  };

  const fetchOrders = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`${apiBase}/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
  };

  // ===================== CHATBOT =====================
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${apiBase}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: msg, comicsContext: comics }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại!', timestamp: new Date() }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ===================== ADMIN =====================
  const handleAddComic = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genres', JSON.stringify(genres.split(',').map(g => g.trim())));
    formData.append('description', description);
    formData.append('status', status);
    formData.append('price', String(price));
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const res = await fetch(`${apiBase}/comics`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data._id || data.comic?._id) {
        showModal('success', 'Thành công!', 'Đã thêm truyện mới vào hệ thống.');
        fetchComics();
        setShowAddComicForm(false);
        setTitle(''); setAuthor(''); setGenres(''); setDescription(''); setCoverImage(null); setPrice(29000);
      }
    } catch { showModal('error', 'Lỗi', 'Không thể thêm truyện. Vui lòng thử lại.'); }
  };

  const handleAddChapter = async () => {
    if (!selectedAdminComic) return;
    const formData = new FormData();
    formData.append('comicId', selectedAdminComic._id);
    formData.append('title', chapterTitle);
    formData.append('chapterNumber', String(chapterNumber));
    chapterImages.forEach(img => formData.append('images', img));

    try {
      const res = await fetch(`${apiBase}/chapters`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data._id) {
        showModal('success', 'Thành công!', 'Đã đăng chương mới thành công.');
        fetchChapters(selectedAdminComic._id);
        setShowAddChapterForm(false);
        setChapterTitle(''); setChapterImages([]);
      }
    } catch { showModal('error', 'Lỗi', 'Không thể thêm chương. Vui lòng thử lại.'); }
  };

  const handleEditComic = async () => {
    if (!editingComic) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genres', JSON.stringify(genres.split(',').map(g => g.trim())));
    formData.append('description', description);
    formData.append('status', status);
    formData.append('price', String(price));
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const res = await fetch(`${apiBase}/comics/${editingComic._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showModal('success', 'Thành công!', 'Đã cập nhật thông tin truyện.');
        fetchComics();
        setShowEditComicForm(false);
        setEditingComic(null);
      } else {
        const data = await res.json();
        showModal('error', 'Lỗi', data.message || 'Không thể cập nhật truyện.');
      }
    } catch { showModal('error', 'Lỗi', 'Không thể cập nhật truyện. Vui lòng thử lại.'); }
  };

  const handleDeleteComic = (comic: Comic) => {
    showModal('confirm', 'Xác nhận xoá truyện', `Bạn có chắc muốn xoá "${comic.title}"?`, 'Tất cả chương và dữ liệu liên quan sẽ bị xoá vĩnh viễn.', async () => {
      try {
        await fetch(`${apiBase}/comics/${comic._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchComics();
        closeModal();
        showModal('success', 'Đã xoá!', `Truyện "${comic.title}" đã được xoá.`);
      } catch { showModal('error', 'Lỗi', 'Không thể xoá truyện. Vui lòng thử lại.'); }
    });
  };

  const handleUpdatePrice = async () => {
    if (!pricingComic) return;
    try {
      const res = await fetch(`${apiBase}/comics/${pricingComic._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        showModal('success', 'Thành công!', `Đã cập nhật giá thành ${newPrice.toLocaleString('vi-VN')}đ.`);
        fetchComics();
        setShowPriceModal(false);
        setPricingComic(null);
      } else {
        showModal('error', 'Lỗi', 'Không thể cập nhật giá.');
      }
    } catch { showModal('error', 'Lỗi', 'Không thể cập nhật giá. Vui lòng thử lại.'); }
  };


  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(`${apiBase}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAdminOrders(Array.isArray(data) ? data : []);
    } catch { setAdminOrders([]); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${apiBase}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAdminOrders();
    } catch { showModal('error', 'Lỗi', 'Không thể cập nhật trạng thái đơn hàng.'); }
  };

  // ===================== ALL GENRES =====================
  const allGenres = [...new Set(comics.flatMap(c => c.genres || []))];
  const filteredComics = filterGenre ? comics.filter(c => c.genres?.includes(filterGenre)) : comics;

  // ===================== RENDER =====================

  const isAdmin = token && (() => { try { return JSON.parse(atob(token.split('.')[1])).role === 'ADMIN'; } catch { return false; } })();

  return (
    <div className="app-root">
      {/* ===== NAV ===== */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setView('public')}>
          <span className="nav-logo">📚</span>
          <span className="nav-title">ComicVerse</span>
        </div>
        <div className="nav-search">
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchComics()}
          />
          <button onClick={fetchComics}>🔍</button>
        </div>
        <div className="nav-actions">
          {token ? (
            <>
              <span className="nav-user">👤 {userEmail}</span>
              {!isAdmin && (
                <button className="nav-btn" onClick={() => { setView('orders'); fetchOrders(); }}>📦 Đơn hàng</button>
              )}
              {isAdmin && (
                <button className="nav-btn nav-btn-admin" onClick={() => setView('admin')}>⚙️ Admin</button>
              )}
              <button className="nav-btn nav-btn-logout" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="nav-btn nav-btn-register" onClick={() => { setView('register'); setAuthError(''); setAuthSuccess(''); }}>Đăng ký</button>
              <button className="nav-btn nav-btn-login" onClick={() => { setView('login'); setAuthError(''); setAuthSuccess(''); }}>Đăng nhập</button>
            </>
          )}
          {!isAdmin && (
            <button className="cart-btn" onClick={() => setView('cart')}>
              🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>
      </nav>

      {/* ===== PUBLIC VIEW ===== */}
      {view === 'public' && (
        <div className="public-view animate-fade-in-up">
          {/* Hero */}
          <div className="hero">
            <div className="hero-content">
              <h1>Kho Truyện Tranh Số 1 Việt Nam</h1>
              <p>Hàng nghìn bộ truyện chất lượng cao, giao hàng toàn quốc</p>
              <button className="hero-cta" onClick={() => document.getElementById('comics-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                Khám phá ngay →
              </button>
            </div>
          </div>

          {/* Top 3 Hot nhất — chỉ ẩn khi chưa load xong hoặc không có truyện nào */}
          {topComics.length > 0 && (
            <div className="section top-section">
              <h2 className="section-title">🔥 Top 3 Truyện Được Mua Nhiều Nhất</h2>
              <div className="top-comics-grid">
                {topComics.map((comic, idx) => (
                  <div key={comic._id} className={`top-comic-card rank-${idx + 1}`}
                    onClick={() => { setSelectedComic(comic); fetchChapters(comic._id); setView('comicDetail'); }}>
                    <div className="top-rank-badge">#{idx + 1}</div>
                    <div className="top-comic-cover">
                      <img
                        src={getImageUrl(comic.coverImage) || `https://picsum.photos/seed/${comic._id}/300/400`}
                        alt={comic.title}
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${comic._id}/300/400`; }}
                      />
                    </div>
                    <div className="top-comic-info">
                      <h3>{comic.title}</h3>
                      <p className="top-author">✍️ {comic.author}</p>
                      <div className="top-stats">
                        <span className="top-purchase">🛒 {comic.purchaseCount || 0} lượt mua</span>
                        <span className="top-rating">
                          {comic.rating > 0 ? (
                            <>⭐ {comic.rating.toFixed(1)}<span className="review-count"> ({comic.reviewCount || 0} đánh giá)</span></>
                          ) : (
                            <span className="review-count">Chưa có đánh giá</span>
                          )}
                        </span>
                      </div>
                      <span className="top-price">{(comic.price || 29000).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {idx === 0 && <div className="hot-flame">🔥 HOT</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre filter */}
          {allGenres.length > 0 && (
            <div className="genre-filter">
              <button className={`genre-tag ${filterGenre === '' ? 'active' : ''}`} onClick={() => setFilterGenre('')}>Tất cả</button>
              {allGenres.map(g => (
                <button key={g} className={`genre-tag ${filterGenre === g ? 'active' : ''}`} onClick={() => setFilterGenre(g)}>{g}</button>
              ))}
            </div>
          )}

          {/* Comics Grid */}
          <div id="comics-grid" className="section">
            <h2 className="section-title">📚 Kho Truyện</h2>
            {loading ? (
              <div className="loading-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="comic-card skeleton" />)}
              </div>
            ) : (
              <div className="comics-grid">
                {filteredComics.map(comic => (
                  <div key={comic._id} className="comic-card">
                    <div className="comic-cover" onClick={() => { setSelectedComic(comic); fetchChapters(comic._id); setView('comicDetail'); }}>
                      <img
                        src={getImageUrl(comic.coverImage) || `https://picsum.photos/seed/${comic._id}/300/400`}
                        alt={comic.title}
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${comic._id}/300/400`; }}
                      />
                      <div className="comic-overlay">
                        <span>Xem chi tiết</span>
                      </div>
                      {comic.status === 'COMPLETED' && <span className="badge-complete">Hoàn thành</span>}
                    </div>
                    <div className="comic-info">
                      <h3 className="comic-title" onClick={() => { setSelectedComic(comic); fetchChapters(comic._id); setView('comicDetail'); }}>
                        {comic.title}
                      </h3>
                      <p className="comic-author">✍️ {comic.author}</p>
                      <div className="comic-genres">
                        {comic.genres?.slice(0, 2).map(g => <span key={g} className="genre-pill">{g}</span>)}
                      </div>
                      <div className="comic-bottom">
                        <span className="comic-price">{(comic.price || 29000).toLocaleString('vi-VN')}đ</span>
                        <button className="btn-add-cart" onClick={() => addToCart(comic)}>🛒 Thêm giỏ</button>
                      </div>
                      {(comic.purchaseCount > 0 || comic.rating > 0) && (
                        <div className="comic-stats-mini">
                          {comic.purchaseCount > 0 && <span>🛒 {comic.purchaseCount} mua</span>}
                          {comic.rating > 0 && <span>⭐ {comic.rating.toFixed(1)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== COMIC DETAIL VIEW ===== */}
      {view === 'comicDetail' && selectedComic && (
        <div className="detail-view animate-fade-in-up">
          <button className="back-btn" onClick={() => setView('public')}>← Quay lại</button>
          {selectedChapter ? (
            <div className="reader-view">
              <div className="reader-header">
                <button onClick={() => setSelectedChapter(null)}>← Mục lục</button>
                <span>{selectedComic.title} - Chương {selectedChapter.chapterNumber}</span>
              </div>
              <div className="reader-pages">
                {selectedChapter.images?.filter(Boolean).map((img, i) => (
                  <img key={i} src={getImageUrl(img)} alt={`Trang ${i + 1}`}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="comic-detail">
              <div className="detail-cover">
                <img
                  src={getImageUrl(selectedComic.coverImage) || `https://picsum.photos/seed/${selectedComic._id}/400/550`}
                  alt={selectedComic.title}
                  onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedComic._id}/400/550`; }}
                />
              </div>
              <div className="detail-info">
                <h1>{selectedComic.title}</h1>
                <p className="detail-author">✍️ {selectedComic.author}</p>
                <div className="detail-genres">
                  {selectedComic.genres?.map(g => <span key={g} className="genre-pill">{g}</span>)}
                </div>
                <p className="detail-description">{selectedComic.description}</p>
                <div className="detail-meta">
                  <span>👁️ {selectedComic.viewCount || 0} lượt xem</span>
                  <span>🛒 {selectedComic.purchaseCount || 0} lượt mua</span>
                  {selectedComic.rating > 0 && (
                    <span>⭐ {selectedComic.rating.toFixed(1)}/5 ({selectedComic.reviewCount} đánh giá)</span>
                  )}
                  <span className={`status-badge ${selectedComic.status === 'COMPLETED' ? 'completed' : 'ongoing'}`}>
                    {selectedComic.status === 'COMPLETED' ? '✅ Hoàn thành' : '🔄 Đang tiến hành'}
                  </span>
                </div>
                <div className="detail-buy">
                  <span className="detail-price">{(selectedComic.price || 29000).toLocaleString('vi-VN')}đ</span>
                  <button className="btn-buy" onClick={() => { addToCart(selectedComic); setView('cart'); }}>🛒 Mua ngay</button>
                  <button className="btn-add-cart" onClick={() => addToCart(selectedComic)}>+ Giỏ hàng</button>
                </div>
                <div className="chapters-list">
                  <h3>📖 Danh sách chương ({chapters.length})</h3>
                  {chapters.length === 0 ? (
                    <p className="no-chapters">Chưa có chương nào</p>
                  ) : (
                    <div className="chapters-grid">
                      {chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map(ch => (
                        <button key={ch._id} className="chapter-item" onClick={() => setSelectedChapter(ch)}>
                          Chương {ch.chapterNumber}: {ch.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LOGIN VIEW ===== */}
      {view === 'login' && (
        <div className="auth-view animate-fade-in-up">
          <div className="auth-card animate-scale-in">
            <div className="auth-brand" onClick={() => setView('public')}>
              <span>📚</span>
              <span className="auth-brand-name">ComicVerse</span>
            </div>
            <h2 className="auth-title">Chào mừng trở lại!</h2>
            <p className="auth-subtitle">Đăng nhập để tiếp tục mua truyện và theo dõi đơn hàng</p>

            {authError && <div className="auth-alert auth-alert-error">⚠️ {authError}</div>}
            {authSuccess && <div className="auth-alert auth-alert-success">✅ {authSuccess}</div>}

            <div className="auth-form">
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setAuthError(''); }} />
                </div>
              </div>
              <div className="auth-field">
                <label>Mật khẩu</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); setAuthError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button className="auth-eye" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button className="btn-auth-primary" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? <span className="auth-spinner" /> : 'Đăng nhập →'}
              </button>
            </div>

            <div className="auth-divider"><span>hoặc</span></div>
            <div className="auth-switch">
              Chưa có tài khoản?{' '}
              <button onClick={() => { setView('register'); setAuthError(''); setAuthSuccess(''); }}>
                Đăng ký ngay
              </button>
            </div>
            <button className="auth-back" onClick={() => setView('public')}>← Quay lại cửa hàng</button>
          </div>
        </div>
      )}

      {/* ===== REGISTER VIEW ===== */}
      {view === 'register' && (
        <div className="auth-view animate-fade-in-up">
          <div className="auth-card animate-scale-in">
            <div className="auth-brand" onClick={() => setView('public')}>
              <span>📚</span>
              <span className="auth-brand-name">ComicVerse</span>
            </div>
            <h2 className="auth-title">Tạo tài khoản mới</h2>
            <p className="auth-subtitle">Tham gia cộng đồng hơn 10.000 độc giả truyện tranh</p>

            {authError && <div className="auth-alert auth-alert-error">⚠️ {authError}</div>}
            {authSuccess && <div className="auth-alert auth-alert-success">✅ {authSuccess}</div>}

            <div className="auth-form">
              <div className="auth-field">
                <label>Tên người dùng</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input type="text" placeholder="tên_của_bạn" value={regUsername}
                    onChange={e => { setRegUsername(e.target.value); setAuthError(''); }} />
                </div>
              </div>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input type="email" placeholder="your@email.com" value={regEmail}
                    onChange={e => { setRegEmail(e.target.value); setAuthError(''); }} />
                </div>
              </div>
              <div className="auth-field">
                <label>Mật khẩu</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự" value={regPassword}
                    onChange={e => { setRegPassword(e.target.value); setAuthError(''); }} />
                  <button className="auth-eye" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {regPassword && (
                  <div className="password-strength">
                    <div className={`strength-bar ${regPassword.length >= 6 ? regPassword.length >= 10 ? 'strong' : 'medium' : 'weak'}`} />
                    <span>{regPassword.length >= 10 ? '🟢 Mạnh' : regPassword.length >= 6 ? '🟡 Trung bình' : '🔴 Yếu'}</span>
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label>Xác nhận mật khẩu</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔑</span>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={regConfirm}
                    onChange={e => { setRegConfirm(e.target.value); setAuthError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                  {regConfirm && (
                    <span className="auth-match">{regPassword === regConfirm ? '✅' : '❌'}</span>
                  )}
                </div>
              </div>
              <button className="btn-auth-primary btn-auth-register" onClick={handleRegister} disabled={authLoading}>
                {authLoading ? <span className="auth-spinner" /> : 'Tạo tài khoản →'}
              </button>
            </div>

            <div className="auth-divider"><span>hoặc</span></div>
            <div className="auth-switch">
              Đã có tài khoản?{' '}
              <button onClick={() => { setView('login'); setAuthError(''); setAuthSuccess(''); }}>
                Đăng nhập
              </button>
            </div>
            <button className="auth-back" onClick={() => setView('public')}>← Quay lại cửa hàng</button>
          </div>
        </div>
      )}

      {/* ===== CART VIEW ===== */}
      {view === 'cart' && (
        <div className="cart-view animate-fade-in-up">
          <button className="back-btn" onClick={() => setView('public')}>← Tiếp tục mua hàng</button>
          <h2>🛒 Giỏ hàng của bạn</h2>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span>🛒</span>
              <p>Giỏ hàng trống</p>
              <button className="btn-primary" onClick={() => setView('public')}>Mua sắm ngay</button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.comic._id} className="cart-item">
                    <img src={getImageUrl(item.comic.coverImage) || `https://picsum.photos/seed/${item.comic._id}/80/110`} alt={item.comic.title}
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.comic._id}/80/110`; }} />
                    <div className="cart-item-info">
                      <h4>{item.comic.title}</h4>
                      <p>✍️ {item.comic.author}</p>
                      <p className="cart-item-price">{item.comic.price?.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQty(item.comic._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.comic._id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-subtotal">
                      {(item.comic.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.comic._id)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div className="summary-row"><span>Tạm tính</span><span>{cartTotal.toLocaleString('vi-VN')}đ</span></div>
                <div className="summary-row"><span>Phí giao hàng</span><span>Miễn phí</span></div>
                <div className="summary-row total"><span>Tổng cộng</span><span>{cartTotal.toLocaleString('vi-VN')}đ</span></div>
                <button className="btn-checkout" onClick={() => { if (!token) { setView('login'); } else { setView('checkout'); } }}>
                  Tiến hành thanh toán →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== CHECKOUT VIEW ===== */}
      {view === 'checkout' && (
        <div className="checkout-view animate-fade-in-up">
          <button className="back-btn" onClick={() => setView('cart')}>← Quay lại giỏ hàng</button>
          <h2>💳 Thanh toán</h2>
          <div className="checkout-layout">
            <div className="checkout-form animate-scale-in">
              <h3>Thông tin giao hàng</h3>
              <div className="form-group">
                <label>Địa chỉ giao hàng *</label>
                <input type="text" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phương thức thanh toán</label>
                <div className="payment-methods">
                  {[
                    { id: 'COD', label: '💵 Tiền mặt khi nhận hàng', desc: 'Thanh toán khi nhận' },
                    { id: 'BANK_TRANSFER', label: '🏦 Chuyển khoản ngân hàng', desc: 'Vietcombank / Techcombank' },
                    { id: 'MOMO', label: '📱 Ví MoMo', desc: 'Thanh toán nhanh' },
                    { id: 'VNPAY', label: '💳 VNPay', desc: 'Cổng thanh toán VNPay' },
                  ].map(m => (
                    <label key={m.id} className={`payment-option ${paymentMethod === m.id ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)} />
                      <div>
                        <span className="payment-label">{m.label}</span>
                        <span className="payment-desc">{m.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Ghi chú (tuỳ chọn)</label>
                <textarea placeholder="Ghi chú thêm cho đơn hàng..."
                  value={checkoutNote} onChange={e => setCheckoutNote(e.target.value)} />
              </div>
            </div>
            <div className="checkout-summary">
              <h3>Đơn hàng của bạn</h3>
              {cart.map(item => (
                <div key={item.comic._id} className="checkout-item">
                  <span>{item.comic.title} x{item.quantity}</span>
                  <span>{(item.comic.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
              <div className="checkout-total">
                <span>Tổng cộng</span>
                <span className="total-amount">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <button className="btn-place-order" onClick={handleCheckout}>✅ Đặt hàng</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ORDERS VIEW ===== */}
      {view === 'orders' && (
        <div className="orders-view animate-fade-in-up">
          <button className="back-btn" onClick={() => setView('public')}>← Về trang chủ</button>
          <h2>📦 Đơn hàng của tôi</h2>
          {lastOrder && (
            <div className="order-success-banner">
              ✅ Đặt hàng thành công! Mã đơn: <strong>{lastOrder.paymentRef}</strong>
              <br />{lastOrder.message}
            </div>
          )}
          {orders.length === 0 ? (
            <div className="empty-orders">
              <span>📦</span>
              <p>Bạn chưa có đơn hàng nào</p>
              <button className="btn-primary" onClick={() => setView('public')}>Mua sắm ngay</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-ref">#{order.paymentRef}</span>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>{
                      { PENDING: '⏳ Chờ xử lý', PAID: '✅ Đã thanh toán', DELIVERED: '🎉 Đã giao', CANCELLED: '❌ Đã huỷ' }[order.status] || order.status
                    }</span>
                  </div>
                  <div className="order-items">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="order-item-row">
                        <span>{item.title} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span>Tổng: <strong>{order.totalAmount?.toLocaleString('vi-VN')}đ</strong></span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {/* Nút đánh giá sao — hiện sau khi đặt hàng thành công */}
                  {(order.status === 'DELIVERED' || order.status === 'PAID' || order.status === 'PENDING') && (
                    <div className="order-review-row">
                      {order.items?.map((item: any, i: number) => {
                        const reviewKey = `${order._id}_${item.comicId}`;
                        const alreadyReviewed = reviewedOrders.has(reviewKey);
                        return (
                          <button
                            key={i}
                            className={`btn-review ${alreadyReviewed ? 'reviewed' : ''}`}
                            disabled={alreadyReviewed}
                            onClick={() => !alreadyReviewed && openReviewModal(order._id, item.comicId, item.title)}
                          >
                            {alreadyReviewed ? '✅ Đã đánh giá' : `⭐ Đánh giá "${item.title}"`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ADMIN VIEW ===== */}
      {view === 'admin' && isAdmin && (
        <div className="admin-view animate-fade-in-up">
          <h2>⚙️ Bảng Quản Trị</h2>
          <div className="admin-tabs">
            <button className="admin-tab active" onClick={() => { setSelectedAdminComic(null); setShowAddComicForm(false); setShowAddChapterForm(false); }}>📚 Truyện</button>
            <button className="admin-tab" onClick={() => fetchAdminOrders()}>📦 Đơn hàng ({adminOrders.length})</button>
          </div>

          {/* Admin Comics */}
          {!showAddComicForm && !showEditComicForm && !selectedAdminComic && adminOrders.length === 0 && (
            <div className="admin-comics-grid">
              <div className="admin-comics-header">
                <h3>Danh sách truyện ({comics.length})</h3>
                <button className="btn-add" onClick={() => setShowAddComicForm(true)}>➕ Thêm truyện mới</button>
              </div>
              <div className="comics-grid">
                {comics.map(comic => (
                  <div key={comic._id} className="comic-card admin-comic-card">
                    <div style={{cursor:'pointer'}} onClick={() => { setSelectedAdminComic(comic); fetchChapters(comic._id); }}>
                      <img src={getImageUrl(comic.coverImage) || `https://picsum.photos/seed/${comic._id}/300/400`} alt={comic.title}
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${comic._id}/300/400`; }} />
                      <div className="comic-info">
                        <h3>{comic.title}</h3>
                        <p>{comic.author}</p>
                        <p className="comic-price">{(comic.price || 29000).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                    <div className="admin-card-actions">
                      <button className="btn-edit-small" title="Sửa thông tin" onClick={e => { e.stopPropagation(); setEditingComic(comic); setTitle(comic.title); setAuthor(comic.author); setGenres((comic.genres||[]).join(', ')); setDescription(comic.description); setStatus(comic.status); setPrice(comic.price||29000); setCoverImage(null); setShowEditComicForm(true); }}>✏️ Sửa</button>
                      <button className="btn-price-small" title="Đổi giá" onClick={e => { e.stopPropagation(); setPricingComic(comic); setNewPrice(comic.price||29000); setShowPriceModal(true); }}>💰 Giá</button>
                      <button className="btn-delete-small" title="Xoá truyện" onClick={e => { e.stopPropagation(); handleDeleteComic(comic); }}>🗑️ Xoá</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comic Form */}
          {showAddComicForm && (
            <div className="admin-form animate-scale-in">
              <button className="admin-back-btn" onClick={() => setShowAddComicForm(false)}>← Quay lại</button>
              <h3>➕ Thêm truyện mới</h3>
              <div className="form-grid">
                <div className="form-group"><label>Tên truyện *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên truyện" /></div>
                <div className="form-group"><label>Tác giả *</label><input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Tên tác giả" /></div>
                <div className="form-group"><label>Thể loại</label><input value={genres} onChange={e => setGenres(e.target.value)} placeholder="Hành động, Phiêu lưu, ..." /></div>
                <div className="form-group"><label>Giá bán (VNĐ)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
                <div className="form-group"><label>Trạng thái</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="ONGOING">Đang tiến hành</option>
                    <option value="COMPLETED">Hoàn thành</option>
                  </select>
                </div>
                <div className="form-group full-width"><label>Mô tả</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả nội dung truyện" /></div>
                <div className="form-group full-width"><label>Ảnh bìa</label><input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} /></div>
              </div>
              <button className="btn-submit" onClick={handleAddComic}>✅ Tạo truyện</button>
            </div>
          )}

          {/* Edit Comic Form */}
          {showEditComicForm && editingComic && (
            <div className="admin-form animate-scale-in">
              <button className="admin-back-btn" onClick={() => { setShowEditComicForm(false); setEditingComic(null); }}>← Quay lại</button>
              <h3>✏️ Sửa truyện - {editingComic.title}</h3>
              <div className="form-grid">
                <div className="form-group"><label>Tên truyện *</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div className="form-group"><label>Tác giả *</label><input value={author} onChange={e => setAuthor(e.target.value)} /></div>
                <div className="form-group"><label>Thể loại</label><input value={genres} onChange={e => setGenres(e.target.value)} placeholder="Hành động, Phiêu lưu, ..." /></div>
                <div className="form-group"><label>Giá bán (VNĐ)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
                <div className="form-group"><label>Trạng thái</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="ONGOING">Đang tiến hành</option>
                    <option value="COMPLETED">Hoàn thành</option>
                  </select>
                </div>
                <div className="form-group full-width"><label>Mô tả</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
                <div className="form-group full-width"><label>Ảnh bìa mới (tuỳ chọn)</label><input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} /></div>
              </div>
              <button className="btn-submit" onClick={handleEditComic}>💾 Lưu thay đổi</button>
            </div>
          )}

          {/* Price Update Modal */}
          {showPriceModal && pricingComic && (
            <div className="modal-overlay animate-fade-in-up" onClick={e => { if (e.target === e.currentTarget) { setShowPriceModal(false); setPricingComic(null); } }}>
              <div className="modal-card animate-scale-in" style={{maxWidth:'400px'}}>
                <div className="modal-icon-wrap"><div className="modal-icon" style={{fontSize:'2rem'}}>💰</div></div>
                <div className="modal-body">
                  <h3 className="modal-title">Cập nhật giá</h3>
                  <p className="modal-message">{pricingComic.title}</p>
                  <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'0.75rem'}}>Giá hiện tại: <strong>{(pricingComic.price||29000).toLocaleString('vi-VN')}đ</strong></p>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    style={{width:'100%',padding:'0.6rem 0.8rem',borderRadius:'8px',border:'1.5px solid var(--border)',fontSize:'1rem',background:'var(--surface)',color:'var(--text)'}}
                    min={0}
                  />
                  <p style={{color:'var(--text-muted)',fontSize:'0.8rem',marginTop:'0.4rem'}}>Giá mới: <strong style={{color:'var(--primary)'}}>{newPrice.toLocaleString('vi-VN')}đ</strong></p>
                </div>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-cancel" onClick={() => { setShowPriceModal(false); setPricingComic(null); }}>Huỷ</button>
                  <button className="modal-btn modal-btn-primary" onClick={handleUpdatePrice}>💾 Lưu giá</button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Comic Detail */}
          {selectedAdminComic && !showAddChapterForm && (
            <div className="admin-detail animate-scale-in">
              <button className="admin-back-btn" onClick={() => setSelectedAdminComic(null)}>← Danh sách truyện</button>
              <div className="admin-detail-header">
                <img src={getImageUrl(selectedAdminComic.coverImage) || `https://picsum.photos/seed/${selectedAdminComic._id}/200/280`} alt=""
                  onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedAdminComic._id}/200/280`; }} />
                <div>
                  <h3>{selectedAdminComic.title}</h3>
                  <p>✍️ {selectedAdminComic.author}</p>
                  <p>💰 {(selectedAdminComic.price || 29000).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
              <div className="admin-chapters-header">
                <h4>📖 Danh sách chương ({chapters.length})</h4>
                <button className="btn-add" onClick={() => { setShowAddChapterForm(true); setChapterNumber(chapters.length + 1); }}>➕ Đăng chương mới</button>
              </div>
              <div className="chapters-admin-list">
                {chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map(ch => (
                  <div key={ch._id} className="chapter-admin-item">
                    <span>Chương {ch.chapterNumber}: {ch.title}</span>
                    <button className="btn-delete" onClick={async () => {
                      showModal('confirm', 'Xác nhận xoá', `Bạn có chắc muốn xoá Chương ${ch.chapterNumber}?`, 'Hành động này không thể hoàn tác.', async () => { await fetch(`${apiBase}/chapters/${ch._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchChapters(selectedAdminComic._id); closeModal(); });
                    }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Chapter Form */}
          {selectedAdminComic && showAddChapterForm && (
            <div className="admin-form animate-scale-in">
              <button className="admin-back-btn" onClick={() => setShowAddChapterForm(false)}>← Quay lại mục lục</button>
              <h3>➕ Đăng chương mới - {selectedAdminComic.title}</h3>
              <div className="form-grid">
                <div className="form-group"><label>Số chương</label><input type="number" value={chapterNumber} onChange={e => setChapterNumber(Number(e.target.value))} /></div>
                <div className="form-group"><label>Tiêu đề chương</label><input value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} placeholder="Tên chương" /></div>
                <div className="form-group full-width"><label>Upload ảnh trang</label>
                  <input type="file" multiple accept="image/*" onChange={e => setChapterImages(Array.from(e.target.files || []))} />
                </div>
              </div>
              <button className="btn-submit" onClick={handleAddChapter}>✅ Đăng chương</button>
            </div>
          )}

          {/* Admin Orders */}
          {adminOrders.length > 0 && (
            <div className="admin-orders">
              <h3>📦 Quản lý đơn hàng ({adminOrders.length})</h3>
              <div className="orders-table">
                {adminOrders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <span>#{order.paymentRef}</span>
                      <select value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)} className="status-select">
                        <option value="PENDING">⏳ Chờ xử lý</option>
                        <option value="PAID">✅ Đã thanh toán</option>
                        <option value="DELIVERED">🎉 Đã giao</option>
                        <option value="CANCELLED">❌ Huỷ</option>
                      </select>
                    </div>
                    <p>👤 {(order as any).userEmail}</p>
                    <p>💰 {order.totalAmount?.toLocaleString('vi-VN')}đ</p>
                    <p>📅 {new Date((order as any).createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== AI CHATBOT ===== */}
      <div className={`chatbot-container ${chatOpen ? 'open' : ''}`}>
        {chatOpen && (
          <div className="chatbot-window animate-scale-in">
            <div className="chatbot-header">
              <div className="chatbot-avatar-wrap">
                <div className="chatbot-avatar-inner">🤖</div>
                <div className="chatbot-online-dot" />
              </div>
              <div className="chatbot-header-info">
                <h4>Trợ lý ComicVerse AI</h4>
                <span className="chatbot-status">
                  <span className="status-pulse" />
                  Trực tuyến
                </span>
              </div>
              <button className="chatbot-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="msg-avatar-wrap">🤖</div>
                  )}
                  <div className="msg-bubble">
                    {msg.content}
                    <span className="msg-time">
                      {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-msg assistant">
                  <div className="msg-avatar-wrap">🤖</div>
                  <div className="msg-bubble typing"><span /><span /><span /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chatbot-suggestions">
              {['🔍 Gợi ý truyện hay', '💳 Cách thanh toán?', '🔄 Chính sách đổi trả'].map(s => (
                <button key={s} onClick={() => { setChatInput(s.replace(/^[^ ]+ /, '')); }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              />
              <button className="chatbot-send" onClick={sendChatMessage} disabled={chatLoading}>
                {chatLoading ? <span className="send-spinner" /> : '➤'}
              </button>
            </div>
          </div>
        )}
        <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? (
            <span>✕</span>
          ) : (
            <>
              <span className="chatbot-toggle-icon">💬</span>
              <span className="chatbot-label">Hỏi AI</span>
              <span className="chatbot-toggle-badge">AI</span>
            </>
          )}
        </button>
      </div>

      {/* ===== CUSTOM MODAL ===== */}
      {modal.open && (
        <div className="modal-overlay animate-fade-in-up" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className={`modal-card animate-scale-in modal-${modal.type}`}>
            <div className="modal-icon-wrap">
              <div className={`modal-icon modal-icon-${modal.type}`}>
                {modal.type === 'success' && '✅'}
                {modal.type === 'order' && '🎉'}
                {modal.type === 'error' && '❌'}
                {modal.type === 'info' && 'ℹ️'}
                {modal.type === 'confirm' && '⚠️'}
              </div>
            </div>
            <div className="modal-body">
              <h3 className="modal-title">{modal.title}</h3>
              <p className="modal-message">{modal.message}</p>
              {modal.detail && (
                <div className="modal-detail">
                  <code>{modal.detail}</code>
                </div>
              )}
            </div>
            <div className="modal-actions">
              {modal.type === 'confirm' ? (
                <>
                  <button className="modal-btn modal-btn-cancel" onClick={closeModal}>Huỷ</button>
                  <button className="modal-btn modal-btn-danger" onClick={modal.onConfirm}>Xác nhận xoá</button>
                </>
              ) : (
                <button className="modal-btn modal-btn-primary" onClick={closeModal}>
                  {modal.type === 'order' ? '🛍️ Xem đơn hàng' : 'Đóng'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ===== STAR REVIEW MODAL ===== */}
      {reviewComicId && (
        <div className="modal-overlay" onClick={() => setReviewComicId(null)}>
          <div className="modal-card review-modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReviewComicId(null)}>✕</button>
            <div className="review-modal-icon">⭐</div>
            <h3 className="modal-title">Đánh giá sản phẩm</h3>
            <p className="review-comic-name">"{reviewComicTitle}"</p>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map(s => (
                <span
                  key={s}
                  className={`star-btn ${s <= (reviewHover || reviewStar) ? 'active' : ''}`}
                  onMouseEnter={() => setReviewHover(s)}
                  onMouseLeave={() => setReviewHover(0)}
                  onClick={() => setReviewStar(s)}
                >★</span>
              ))}
            </div>
            <p className="star-label">
              {reviewStar === 0 ? 'Chọn số sao' : ['', 'Rất tệ 😞', 'Tạm được 😐', 'Bình thường 🙂', 'Tốt 😊', 'Xuất sắc 🤩'][reviewStar]}
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setReviewComicId(null)}>Huỷ</button>
              <button
                className="modal-btn modal-btn-primary"
                disabled={reviewStar === 0}
                onClick={submitReview}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
