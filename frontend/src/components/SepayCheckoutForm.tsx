import { useEffect, useRef } from 'react';

interface SepayCheckoutFormProps {
  checkoutUrl: string;
  checkoutFields: Record<string, any>;
  /** Nếu autoSubmit=true thì tự redirect ngay, mặc định false (hiện nút bấm) */
  autoSubmit?: boolean;
}

/**
 * Component tạo form POST và submit sang trang thanh toán SePay.
 *
 * Dùng sau khi gọi POST /orders và nhận được checkoutUrl + checkoutFields:
 *
 * const { checkoutUrl, checkoutFields } = await createOrder({...});
 * return <SepayCheckoutForm checkoutUrl={checkoutUrl} checkoutFields={checkoutFields} />;
 */
export function SepayCheckoutForm({
  checkoutUrl,
  checkoutFields,
  autoSubmit = false,
}: SepayCheckoutFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoSubmit && formRef.current) {
      formRef.current.submit();
    }
  }, [autoSubmit]);

  return (
    <form ref={formRef} action={checkoutUrl} method="POST">
      {Object.entries(checkoutFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}

      {!autoSubmit && (
        <button
          type="submit"
          style={{
            padding: '12px 32px',
            background: '#e53e3e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Thanh toán ngay qua SePay
        </button>
      )}
    </form>
  );
}

/**
 * Ví dụ sử dụng trong trang checkout:
 *
 * const [checkoutData, setCheckoutData] = useState(null);
 *
 * const handlePlaceOrder = async () => {
 *   const res = await fetch('/api/orders', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       userId, userEmail, items,
 *       paymentMethod: 'BANK_TRANSFER',
 *       shippingAddress,
 *     }),
 *   });
 *   const data = await res.json();
 *   if (data.checkoutUrl) setCheckoutData(data);
 * };
 *
 * return checkoutData
 *   ? <SepayCheckoutForm checkoutUrl={checkoutData.checkoutUrl} checkoutFields={checkoutData.checkoutFields} />
 *   : <button onClick={handlePlaceOrder}>Đặt hàng</button>;
 */
