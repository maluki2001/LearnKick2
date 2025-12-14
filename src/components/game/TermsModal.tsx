'use client'

import React from 'react'

// Inline translations for terms and conditions
const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Privacy & Terms',
    subtitle: 'How we protect your information',

    // Section 1: What we collect
    section1Title: 'What information do we collect?',
    section1Content: 'When you link your account with an email, we only collect your email address. This helps you access your game progress from any device.',

    // Section 2: How we use it
    section2Title: 'How do we use your email?',
    section2Bullet1: 'To send you a verification code when you link your account',
    section2Bullet2: 'To send you a login code when you access from a new device',
    section2Bullet3: 'To help you recover your account if needed',

    // Section 3: What we DON'T do
    section3Title: 'What we will NEVER do',
    section3Bullet1: 'We will NEVER share your email with anyone',
    section3Bullet2: 'We will NEVER send you marketing emails or spam',
    section3Bullet3: 'We will NEVER sell your information to other companies',

    // Section 4: Data storage
    section4Title: 'Where is your data stored?',
    section4Content: 'Your email is stored securely in our database. We use encryption to protect your information. Only you can access your account.',

    // Section 5: Your rights
    section5Title: 'Your rights',
    section5Bullet1: 'You can unlink your email at any time',
    section5Bullet2: 'You can ask us to delete all your data',
    section5Bullet3: 'You can play without linking an email (but you may lose progress)',

    // Section 6: For parents
    section6Title: 'For Parents & Guardians',
    section6Content: 'LearnKick is designed for children aged 6-12. We take privacy seriously and comply with child protection regulations. No personal data is shared with third parties. Contact us if you have any concerns.',

    // Footer
    lastUpdated: 'Last updated: December 2024',
    contact: 'Questions? Contact us at: privacy@learnkick.com',

    // Buttons
    accept: 'I Understand',
    close: 'Close',
  },
  de: {
    title: 'Datenschutz & Bedingungen',
    subtitle: 'Wie wir deine Informationen schützen',

    section1Title: 'Welche Informationen sammeln wir?',
    section1Content: 'Wenn du dein Konto mit einer E-Mail verknüpfst, sammeln wir nur deine E-Mail-Adresse. Das hilft dir, deinen Spielfortschritt von jedem Gerät aus abzurufen.',

    section2Title: 'Wie verwenden wir deine E-Mail?',
    section2Bullet1: 'Um dir einen Bestätigungscode zu senden, wenn du dein Konto verknüpfst',
    section2Bullet2: 'Um dir einen Anmeldecode zu senden, wenn du von einem neuen Gerät aus zugreifst',
    section2Bullet3: 'Um dir zu helfen, dein Konto bei Bedarf wiederherzustellen',

    section3Title: 'Was wir NIEMALS tun werden',
    section3Bullet1: 'Wir werden deine E-Mail NIEMALS mit jemandem teilen',
    section3Bullet2: 'Wir werden dir NIEMALS Marketing-E-Mails oder Spam senden',
    section3Bullet3: 'Wir werden deine Informationen NIEMALS an andere Unternehmen verkaufen',

    section4Title: 'Wo werden deine Daten gespeichert?',
    section4Content: 'Deine E-Mail wird sicher in unserer Datenbank gespeichert. Wir verwenden Verschlüsselung, um deine Informationen zu schützen. Nur du kannst auf dein Konto zugreifen.',

    section5Title: 'Deine Rechte',
    section5Bullet1: 'Du kannst deine E-Mail jederzeit trennen',
    section5Bullet2: 'Du kannst uns bitten, alle deine Daten zu löschen',
    section5Bullet3: 'Du kannst spielen, ohne eine E-Mail zu verknüpfen (aber du könntest deinen Fortschritt verlieren)',

    section6Title: 'Für Eltern & Erziehungsberechtigte',
    section6Content: 'LearnKick ist für Kinder im Alter von 6-12 Jahren konzipiert. Wir nehmen den Datenschutz ernst und halten uns an Kinderschutzvorschriften. Keine persönlichen Daten werden an Dritte weitergegeben. Kontaktiere uns bei Fragen.',

    lastUpdated: 'Zuletzt aktualisiert: Dezember 2024',
    contact: 'Fragen? Kontaktiere uns: privacy@learnkick.com',

    accept: 'Ich verstehe',
    close: 'Schliessen',
  },
  fr: {
    title: 'Confidentialité & Conditions',
    subtitle: 'Comment nous protégeons vos informations',

    section1Title: 'Quelles informations collectons-nous?',
    section1Content: 'Lorsque vous liez votre compte à un email, nous ne collectons que votre adresse email. Cela vous aide à accéder à votre progression depuis n\'importe quel appareil.',

    section2Title: 'Comment utilisons-nous votre email?',
    section2Bullet1: 'Pour vous envoyer un code de vérification lorsque vous liez votre compte',
    section2Bullet2: 'Pour vous envoyer un code de connexion lorsque vous accédez depuis un nouvel appareil',
    section2Bullet3: 'Pour vous aider à récupérer votre compte si nécessaire',

    section3Title: 'Ce que nous ne ferons JAMAIS',
    section3Bullet1: 'Nous ne partagerons JAMAIS votre email avec qui que ce soit',
    section3Bullet2: 'Nous ne vous enverrons JAMAIS d\'emails marketing ou de spam',
    section3Bullet3: 'Nous ne vendrons JAMAIS vos informations à d\'autres entreprises',

    section4Title: 'Où sont stockées vos données?',
    section4Content: 'Votre email est stocké de manière sécurisée dans notre base de données. Nous utilisons le cryptage pour protéger vos informations. Vous seul pouvez accéder à votre compte.',

    section5Title: 'Vos droits',
    section5Bullet1: 'Vous pouvez délier votre email à tout moment',
    section5Bullet2: 'Vous pouvez nous demander de supprimer toutes vos données',
    section5Bullet3: 'Vous pouvez jouer sans lier d\'email (mais vous pourriez perdre votre progression)',

    section6Title: 'Pour les Parents & Tuteurs',
    section6Content: 'LearnKick est conçu pour les enfants de 6 à 12 ans. Nous prenons la confidentialité au sérieux et respectons les réglementations de protection des enfants. Aucune donnée personnelle n\'est partagée avec des tiers. Contactez-nous si vous avez des questions.',

    lastUpdated: 'Dernière mise à jour: Décembre 2024',
    contact: 'Questions? Contactez-nous: privacy@learnkick.com',

    accept: 'Je comprends',
    close: 'Fermer',
  },
  sq: {
    title: 'Privatësia & Kushtet',
    subtitle: 'Si i mbrojmë informacionet tuaja',

    section1Title: 'Çfarë informacioni mbledhim?',
    section1Content: 'Kur lidhni llogarinë tuaj me një email, ne mbledhim vetëm adresën tuaj të emailit. Kjo ju ndihmon të aksesoni përparimin tuaj të lojës nga çdo pajisje.',

    section2Title: 'Si e përdorim emailin tuaj?',
    section2Bullet1: 'Për t\'ju dërguar një kod verifikimi kur lidhni llogarinë tuaj',
    section2Bullet2: 'Për t\'ju dërguar një kod hyrjeje kur aksesoni nga një pajisje e re',
    section2Bullet3: 'Për t\'ju ndihmuar të rikuperoni llogarinë tuaj nëse nevojitet',

    section3Title: 'Çfarë nuk do të bëjmë KURRË',
    section3Bullet1: 'Ne KURRË nuk do ta ndajmë emailin tuaj me askënd',
    section3Bullet2: 'Ne KURRË nuk do t\'ju dërgojmë email marketingu ose spam',
    section3Bullet3: 'Ne KURRË nuk do t\'i shesim informacionet tuaja kompanive të tjera',

    section4Title: 'Ku ruhen të dhënat tuaja?',
    section4Content: 'Emaili juaj ruhet në mënyrë të sigurt në bazën tonë të të dhënave. Ne përdorim enkriptim për të mbrojtur informacionet tuaja. Vetëm ju mund të aksesoni llogarinë tuaj.',

    section5Title: 'Të drejtat tuaja',
    section5Bullet1: 'Ju mund ta shkëputni emailin tuaj në çdo kohë',
    section5Bullet2: 'Ju mund të na kërkoni të fshijmë të gjitha të dhënat tuaja',
    section5Bullet3: 'Ju mund të luani pa lidhur një email (por mund të humbni përparimin)',

    section6Title: 'Për Prindërit & Kujdestarët',
    section6Content: 'LearnKick është projektuar për fëmijët e moshës 6-12 vjeç. Ne e marrim seriozisht privatësinë dhe respektojmë rregulloret e mbrojtjes së fëmijëve. Asnjë e dhënë personale nuk ndahet me palë të treta. Na kontaktoni nëse keni pyetje.',

    lastUpdated: 'Përditësuar së fundmi: Dhjetor 2024',
    contact: 'Pyetje? Na kontaktoni: privacy@learnkick.com',

    accept: 'E kuptoj',
    close: 'Mbyll',
  }
}

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  language?: string
  showAcceptButton?: boolean
}

export function TermsModal({
  isOpen,
  onClose,
  onAccept,
  language = 'de',
  showAcceptButton = false
}: TermsModalProps) {
  const t = translations[language] || translations.de

  if (!isOpen) return null

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="text-center p-6 border-b border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">{t.title}</h2>
          <p className="text-gray-400 mt-1 text-sm">{t.subtitle}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: What we collect */}
          <section>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">1</span>
              {t.section1Title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed pl-8">
              {t.section1Content}
            </p>
          </section>

          {/* Section 2: How we use it */}
          <section>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm">2</span>
              {t.section2Title}
            </h3>
            <ul className="text-gray-300 text-sm space-y-2 pl-8">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {t.section2Bullet1}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {t.section2Bullet2}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {t.section2Bullet3}
              </li>
            </ul>
          </section>

          {/* Section 3: What we DON'T do - Important! */}
          <section className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm">3</span>
              {t.section3Title}
            </h3>
            <ul className="text-gray-300 text-sm space-y-2 pl-8">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span className="font-medium">{t.section3Bullet1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span className="font-medium">{t.section3Bullet2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span className="font-medium">{t.section3Bullet3}</span>
              </li>
            </ul>
          </section>

          {/* Section 4: Data storage */}
          <section>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm">4</span>
              {t.section4Title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed pl-8">
              {t.section4Content}
            </p>
          </section>

          {/* Section 5: Your rights */}
          <section>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-sm">5</span>
              {t.section5Title}
            </h3>
            <ul className="text-gray-300 text-sm space-y-2 pl-8">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">✓</span>
                {t.section5Bullet1}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">✓</span>
                {t.section5Bullet2}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">✓</span>
                {t.section5Bullet3}
              </li>
            </ul>
          </section>

          {/* Section 6: For parents */}
          <section className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t.section6Title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.section6Content}
            </p>
          </section>

          {/* Footer info */}
          <div className="text-center text-gray-500 text-xs space-y-1 pt-4 border-t border-white/10">
            <p>{t.lastUpdated}</p>
            <p>{t.contact}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 border-t border-white/10">
          {showAcceptButton ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all"
              >
                {t.close}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                {t.accept}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              {t.close}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TermsModal
