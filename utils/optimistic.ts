/**
 * İyimser (optimistic) aç/kapa güncellemesi + sunucu uzlaştırma + hata rollback'i.
 *
 * Kullanım deseni her yerde aynıydı: önce UI'ı iyimser güncelle, sunucuya yaz,
 * dönen gerçekle uzlaştır, hata olursa geri al. `toggle` bir involution olmalıdır
 * (iki kez çağrılınca başa döner) — böylece rollback = `toggle`'ı tekrar çağırmak.
 *
 * Hem liste öğesi (beğeni) hem tekil durum (takip) için çalışır; state setter'ları
 * çağıran tarafça verilir.
 */
export async function optimisticToggle<TResult>(params: {
  /** İyimser değişim; hata olursa geri almak için ikinci kez çağrılır. */
  toggle: () => void;
  /** Sunucu çağrısı. */
  commit: () => Promise<TResult>;
  /** Sunucu gerçeğiyle uzlaştırma (opsiyonel). */
  reconcile?: (result: TResult) => void;
}): Promise<void> {
  params.toggle();
  try {
    const result = await params.commit();
    params.reconcile?.(result);
  } catch {
    params.toggle(); // geri al
  }
}
