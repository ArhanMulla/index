import { C, F } from '../theme';

const TERMS = `Last updated: [add date]

These are starter Terms of Service for the INDEX platform — written to be genuinely useful for a pilot launch, but they are not a substitute for review by an actual lawyer before you launch publicly or handle payments.

1. What INDEX is
INDEX connects students, researchers, industry partners, and universities around real-world challenges. Users create profiles, post challenges ("ideas"), and apply to collaborate on them.

2. Accounts
You're responsible for keeping your login credentials secure and for the accuracy of the information in your profile. One person, one account.

3. Content you submit
You keep ownership of any idea, challenge, or profile content you submit. By posting it, you allow INDEX to display it to other users of the platform for the purpose of matching and collaboration.

4. Acceptable use
No spam, no impersonation, no posting content that isn't genuinely yours to share, and no using the platform to harass or discriminate against other users.

5. No guarantee of outcomes
INDEX helps people find each other and collaborate — it does not guarantee that any challenge will be completed successfully, that any match will work out, or that any outcome (hire, grade, funding, etc.) will result.

6. Termination
We may suspend or remove accounts that violate these terms or that we reasonably believe are spam, fraudulent, or harmful to other users.

7. Changes
These terms may be updated as the platform evolves. Continued use after a change means you accept the update.

8. Contact
[Add your contact email here.]`;

const PRIVACY = `Last updated: [add date]

This is a starter Privacy Policy — genuinely useful for a pilot launch, but you should have it reviewed before wider release, especially once real personal data from real users is involved.

1. What we collect
Your name, email, role, organization, the skills and domains you list, any CV/portfolio/LinkedIn links you choose to add, and the content of ideas and applications you submit.

2. How we use it
To operate the matching system, to show your profile and submissions to other users as intended by the platform, and to send you notifications about activity relevant to you (e.g. someone applied to your challenge).

3. Who can see it
Your profile is visible to other logged-in users of the platform, since visibility is the point of a collaboration platform. We do not sell your data to third parties.

4. Where it's stored
Data is stored with Supabase, a hosted database provider. Passwords are hashed and never stored in plain text.

5. Your choices
You can edit or remove information from your profile at any time from My Profile. To delete your account entirely, contact us at the email below.

6. Children's privacy
INDEX is intended for university-age students and above. INDEX Junior, aimed at younger students, requires appropriate parental/school consent processes to be added before real launch — this is not yet implemented.

7. Contact
[Add your contact email here.]`;

export default function Legal({ page, onBack }) {
  const isTerms = page === 'terms';
  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: F.body }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 100px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 600, color: C.text, marginBottom: 30 }}>
          {isTerms ? 'Terms of Service' : 'Privacy Policy'}
        </h1>
        <div style={{ background: '#FFF8E6', border: '1px solid #F0DFA8', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: '#7A5C00', marginBottom: 32, lineHeight: 1.6 }}>
          Starter template — fill in the bracketed placeholders and have it reviewed before a public launch. Not legal advice.
        </div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14.5, color: C.text, lineHeight: 1.85 }}>
          {isTerms ? TERMS : PRIVACY}
        </div>
      </div>
    </div>
  );
}
