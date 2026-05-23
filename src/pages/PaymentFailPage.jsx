import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="min-h-screen bg-champagne flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {/* Error icon */}
        <div className="w-20 h-20 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-espresso mb-4">
          {t('pay_failed_title') || 'Payment Failed'}
        </h1>
        <p className="text-warm-gray-dark text-base max-w-sm mx-auto mb-3 leading-relaxed">
          {t('pay_failed_desc') || 'Your payment could not be processed. Please try again or use a different payment method.'}
        </p>

        {orderNumber && (
          <p className="text-sm text-warm-gray mb-8">
            {t('ch_order_number') || 'Order'}: <span className="font-semibold text-espresso">{orderNumber}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Link
            to="/checkout"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('pay_try_again') || 'Try Again'}
          </Link>
          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('ch_back_shop') || 'Back to Shop'}
          </Link>
        </div>
      </div>
    </div>
  );
}
