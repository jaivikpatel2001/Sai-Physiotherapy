import { CLINIC } from '@/lib/seo/clinic';
import styles from './MedicalDisclaimer.module.css';

/**
 * YMYL / EEAT medical disclaimer. Signals to Google & AI answer engines that
 * content is professionally reviewed and not a substitute for diagnosis.
 */
export default function MedicalDisclaimer() {
  return (
    <aside className={styles.box} role="note" aria-label="Medical disclaimer">
      <i className="ri-shield-cross-line" aria-hidden />
      <p>
        <strong>Medically reviewed.</strong> This article is written and
        reviewed by qualified physiotherapists at {CLINIC.legalName}. It is for
        general education only and is not a substitute for a personalised
        diagnosis or treatment plan. Always consult a licensed physiotherapist
        before starting any exercise or treatment.
      </p>
    </aside>
  );
}
