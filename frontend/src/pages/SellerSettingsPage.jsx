import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import sellerSettingsService from '../services/sellerSettingsService';

function SellerSettingsPage() {
  const { fetchUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    profile_image: null,
    profile_image_url: '',
    notification_preferences: {
      order_updates: true,
      review_updates: true,
      marketing_updates: false,
    },
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await sellerSettingsService.getSettings();
        setProfileForm({
          name: data?.name || '',
          email: data?.email || '',
          bio: data?.bio || '',
          profile_image: null,
          profile_image_url: data?.profile_image_url || '',
          notification_preferences: {
            order_updates: data?.notification_preferences?.order_updates ?? true,
            review_updates: data?.notification_preferences?.review_updates ?? true,
            marketing_updates: data?.notification_preferences?.marketing_updates ?? false,
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seller settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setProfileForm((previous) => ({
      ...previous,
      notification_preferences: {
        ...previous.notification_preferences,
        [name]: checked,
      },
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    const previewUrl = file ? URL.createObjectURL(file) : '';

    setProfileForm((previous) => ({
      ...previous,
      profile_image: file,
      profile_image_url: previewUrl || previous.profile_image_url,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setError('');
    setProfileMessage('');

    try {
      const data = await sellerSettingsService.updateProfile(profileForm);
      await fetchUser();
      setProfileForm((previous) => ({
        ...previous,
        name: data?.name || previous.name,
        email: data?.email || previous.email,
        bio: data?.bio || '',
        profile_image: null,
        profile_image_url: data?.profile_image_url || previous.profile_image_url,
        notification_preferences: {
          order_updates: data?.notification_preferences?.order_updates ?? true,
          review_updates: data?.notification_preferences?.review_updates ?? true,
          marketing_updates: data?.notification_preferences?.marketing_updates ?? false,
        },
      }));
      setProfileMessage('Seller profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update seller profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setError('');
    setPasswordMessage('');

    try {
      await sellerSettingsService.updatePassword(passwordForm);
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      setPasswordMessage('Password updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <form id="profile" onSubmit={handleProfileSubmit} className="surface-card p-6 sm:p-7 scroll-mt-32">
          <span className="section-label">Profile</span>
          <h1 className="section-title mt-4">Settings</h1>
          <p className="subtle-copy mt-3 text-sm">
            Update the seller-facing account details that support your public identity and workspace preferences.
          </p>

          {loading ? <div className="mt-6 text-sm text-[var(--color-text-soft)]">Loading settings...</div> : null}

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="field-label">
                Display Name
              </label>
              <input id="name" name="name" type="text" value={profileForm.name} onChange={handleProfileChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input id="email" name="email" type="email" value={profileForm.email} disabled className="text-input opacity-70" />
            </div>

            <div>
              <label htmlFor="bio" className="field-label">
                Bio / About
              </label>
              <textarea id="bio" name="bio" rows="5" value={profileForm.bio} onChange={handleProfileChange} className="text-input" />
            </div>

            <div>
              <label htmlFor="profile_image" className="field-label">
                Profile Image
              </label>
              <input id="profile_image" name="profile_image" type="file" accept="image/*" onChange={handleProfileImageChange} className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(188,184,177,0.28)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)]" />
            </div>

            {error ? <div className="status-message status-error">{error}</div> : null}
            {profileMessage ? <div className="status-message status-success">{profileMessage}</div> : null}

            <button type="submit" disabled={profileSaving || loading} className="btn-base btn-primary w-full">
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <form id="password" onSubmit={handlePasswordSubmit} className="surface-card p-6 sm:p-7 scroll-mt-32">
          <span className="section-label">Password</span>
          <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
            Security
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="current_password" className="field-label">
                Current Password
              </label>
              <input id="current_password" name="current_password" type="password" value={passwordForm.current_password} onChange={handlePasswordChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                New Password
              </label>
              <input id="password" name="password" type="password" value={passwordForm.password} onChange={handlePasswordChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="field-label">
                Confirm Password
              </label>
              <input id="password_confirmation" name="password_confirmation" type="password" value={passwordForm.password_confirmation} onChange={handlePasswordChange} required className="text-input" />
            </div>

            {passwordMessage ? <div className="status-message status-success">{passwordMessage}</div> : null}

            <button type="submit" disabled={passwordSaving} className="btn-base btn-outline w-full">
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        <section id="preferences" className="surface-card p-6 sm:p-7 scroll-mt-32">
          <span className="section-label">Preferences</span>
          <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
            Notifications
          </h2>
          <div className="mt-6 space-y-3">
            {[
              ['order_updates', 'Order updates'],
              ['review_updates', 'Review updates'],
              ['marketing_updates', 'Marketing updates'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] px-4 py-3 text-sm text-[var(--color-text-soft)]">
                <span>{label}</span>
                <input type="checkbox" name={key} checked={Boolean(profileForm.notification_preferences[key])} onChange={handleNotificationChange} className="h-4 w-4 accent-[var(--color-primary)]" />
              </label>
            ))}
          </div>
        </section>
      </section>

      <aside className="surface-card-strong p-6 sm:p-7">
        <span className="section-label">Account Preview</span>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.7rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.88)]">
            {profileForm.profile_image_url ? (
              <img src={profileForm.profile_image_url} alt={profileForm.name || 'Seller profile'} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-[var(--color-primary)]">
                {(profileForm.name || 'S').charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
              {profileForm.name || 'Seller name'}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-soft)]">
              {profileForm.email || 'seller@example.com'}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-7 text-[var(--color-text-soft)]">
          {profileForm.bio || 'Your seller bio will appear here once you save it.'}
        </p>
      </aside>
    </div>
  );
}

export default SellerSettingsPage;
