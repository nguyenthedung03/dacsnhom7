import { Injectable, Logger } from '@nestjs/common';

/**
 * SePay QR Service
 * Docs: https://docs.sepay.vn/tao-ma-qr.html
 *
 * Cách hoạt động:
 *  1. Dùng Quick QR (không cần API key) → ảnh QR embed thẳng qua URL
 *  2. Hoặc dùng SePay API (cần API key) → trả về ảnh QR + webhook khi có GD khớp
 */
@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);

  /**
   * Tạo URL ảnh QR VietQR qua SePay (không cần API key).
   * Hỗ trợ tất cả ngân hàng trong liên minh VietQR (VCB, TCB, MB, ACB…).
   *
   * @param bankCode  Mã ngân hàng theo chuẩn SePay, ví dụ: "MBBank", "Vietcombank"
   * @param accountNumber  Số tài khoản ngân hàng của bạn
   * @param amount   Số tiền (VNĐ)
   * @param description  Nội dung chuyển khoản (paymentRef)
   */
  buildQrImageUrl(
    bankCode: string,
    accountNumber: string,
    amount: number,
    description: string,
  ): string {
    // SePay Quick QR endpoint
    // https://qr.sepay.vn/img?bank=<bankCode>&acc=<account>&template=compact&amount=<amount>&des=<description>
    const base = 'https://qr.sepay.vn/img';
    const params = new URLSearchParams({
      bank: bankCode,
      acc: accountNumber,
      template: 'compact',
      amount: String(amount),
      des: description,
    });
    const url = `${base}?${params.toString()}`;
    this.logger.log(`[SePay] QR URL: ${url}`);
    return url;
  }

  /**
   * (Tuỳ chọn) Gọi SePay API để tạo transaction và lấy URL QR động.
   * Cần SEPAY_API_KEY trong biến môi trường.
   *
   * Endpoint: POST https://my.sepay.vn/userapi/transactions/check
   * Dùng khi bạn muốn webhook tự động cập nhật trạng thái đơn hàng.
   */
  async createTransactionAndGetQr(payload: {
    accountNumber: string;
    amount: number;
    description: string;
    referenceCode: string;
  }): Promise<{ qrUrl: string; transactionId?: string }> {
    const apiKey = process.env.SEPAY_API_KEY;

    if (!apiKey) {
      this.logger.warn('[SePay] SEPAY_API_KEY chưa được cấu hình, dùng Quick QR thay thế');
      return {
        qrUrl: this.buildQrImageUrl(
          process.env.SEPAY_BANK_CODE ?? 'MBBank',
          payload.accountNumber,
          payload.amount,
          payload.description,
        ),
      };
    }

    try {
      const res = await fetch('https://my.sepay.vn/userapi/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          bank_account_id: process.env.SEPAY_BANK_ACCOUNT_ID,
          amount: payload.amount,
          description: payload.description,
          reference_code: payload.referenceCode,
        }),
      });

      if (!res.ok) {
        throw new Error(`SePay API lỗi: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      return {
        qrUrl: data?.data?.qr_url ?? this.buildQrImageUrl(
          process.env.SEPAY_BANK_CODE ?? 'MBBank',
          payload.accountNumber,
          payload.amount,
          payload.description,
        ),
        transactionId: data?.data?.id,
      };
    } catch (err) {
      this.logger.error('[SePay] Lỗi gọi API:', err);
      // Fallback về Quick QR
      return {
        qrUrl: this.buildQrImageUrl(
          process.env.SEPAY_BANK_CODE ?? 'MBBank',
          payload.accountNumber,
          payload.amount,
          payload.description,
        ),
      };
    }
  }
}
