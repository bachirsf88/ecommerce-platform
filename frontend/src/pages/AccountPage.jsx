import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import accountService from '../services/accountService';
import { canAccessBuyerFeatures, isSeller } from '../utils/roles';

function AccountPage() {
  const location = useLocation();
  const { user, fetchUser } = useAuth();
  const { t } = useTranslation();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    profile_image: null,
    profile_image_url: '',
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
    const loadAccount = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await accountService.getAccount();
        setProfileForm({
          name: data?.name || '',
          email: data?.email || '',
          phone_number: data?.phone_number || '',
          profile_image: null,
          profile_image_url: data?.profile_image_url || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || t('accountPage.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [t]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
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
      const data = await accountService.updateProfile(profileForm);
      await fetchUser();
      setProfileForm((previous) => ({
        ...previous,
        name: data?.name || previous.name,
        email: data?.email || previous.email,
        phone_number: data?.phone_number || '',
        profile_image: null,
        profile_image_url: data?.profile_image_url || previous.profile_image_url,
      }));
      setProfileMessage(t('accountPage.accountUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || t('accountPage.updateFailed'));
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
      await accountService.updatePassword(passwordForm);
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      setPasswordMessage(t('accountPage.passwordUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || t('accountPage.passwordUpdateFailed'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const isPersonalShopper = canAccessBuyerFeatures(user);
  const sellerUser = isSeller(user);

  return (
    <div className="page-shell">
      <div className="page-container max-w-[1180px]">
        <section className="surface-card-strong px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="section-label">{t('accountPage.sectionLabel')}</span>
              <h1 className="section-title mt-4">{t('accountPage.title')}</h1>
              <p className="subtle-copy mt-3 max-w-2xl text-sm">
                {t('accountPage.description')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isPersonalShopper ? (
                <>
                  <Link to="/orders" className="btn-base btn-outline">
                    {t('common.myPurchases')}
                  </Link>
                  <Link to="/favorites" className="btn-base btn-outline">
                    {t('common.favorites')}
                  </Link>
                  <Link to="/cart" className="btn-base btn-outline">
                    {t('common.cart')}
                  </Link>
                </>
              ) : null}
              {sellerUser ? (
                <Link to="/seller/dashboard" className="btn-base btn-primary">
                  {t('common.sellerWorkspace')}
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
          to="/account#profile"
          className={`workspace-secondary-link ${location.hash === '' || location.hash === '#profile' ? 'workspace-secondary-link-active' : ''}`}
        >
          {t('common.profile')}
        </Link>
          <Link
          to="/account#password"
          className={`workspace-secondary-link ${location.hash === '#password' ? 'workspace-secondary-link-active' : ''}`}
        >
          {t('common.password')}
        </Link>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-6">
            <form id="profile" onSubmit={handleProfileSubmit} className="surface-card p-6 sm:p-7 scroll-mt-32">
              <span className="section-label">{t('common.profile')}</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                {t('accountPage.personalInformation')}
              </h2>

              {loading ? <div className="mt-6 text-sm text-[var(--color-text-soft)]">{t('accountPage.loading')}</div> : null}

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                    {t('accountPage.fullName')}
                  </label>
                  <input id="name" name="name" type="text" value={profileForm.name} onChange={handleProfileChange} required className="text-input" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                      {t('common.email')}
                    </label>
                    <input id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} required className="text-input" />
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                      {t('accountPage.phone')}
                    </label>
                    <input id="phone_number" name="phone_number" type="text" value={profileForm.phone_number} onChange={handleProfileChange} className="text-input" />
                  </div>
                </div>

                <div>
                  <label htmlFor="profile_image" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                    {t('accountPage.profileImage')}
                  </label>
                  <input id="profile_image" name="profile_image" type="file" accept="image/*" onChange={handleProfileImageChange} className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(188,184,177,0.28)] file:px-4 file:py-2 file:text-sm file:font-semibold" />
                </div>

                {error ? <div className="status-message status-error">{error}</div> : null}
                {profileMessage ? <div className="status-message status-success">{profileMessage}</div> : null}

                <button type="submit" disabled={profileSaving || loading} className="btn-base btn-primary w-full">
                  {profileSaving ? t('accountPage.saving') : t('accountPage.saveAccount')}
                </button>
              </div>
            </form>

            <form id="password" onSubmit={handlePasswordSubmit} className="surface-card p-6 sm:p-7 scroll-mt-32">
              <span className="section-label">{t('common.password')}</span>
              <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-text)]">
                {t('accountPage.security')}
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="current_password" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                    {t('accountPage.currentPassword')}
                  </label>
                  <input id="current_password" name="current_password" type="password" value={passwordForm.current_password} onChange={handlePasswordChange} required className="text-input" />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                    {t('accountPage.newPassword')}
                  </label>
                  <input id="password" name="password" type="password" value={passwordForm.password} onChange={handlePasswordChange} required className="text-input" />
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
                    {t('accountPage.confirmPassword')}
                  </label>
                  <input id="password_confirmation" name="password_confirmation" type="password" value={passwordForm.password_confirmation} onChange={handlePasswordChange} required className="text-input" />
                </div>

                {passwordMessage ? <div className="status-message status-success">{passwordMessage}</div> : null}

                <button type="submit" disabled={passwordSaving} className="btn-base btn-outline w-full">
                  {passwordSaving ? t('accountPage.updating') : t('accountPage.updatePassword')}
                </button>
              </div>
            </form>
          </section>

          <aside className="surface-card-strong p-6 sm:p-7">
            <span className="section-label">{t('common.overview')}</span>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.7rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.86)]">
                {profileForm.profile_image_url ? (
                  <img src={profileForm.profile_image_url} alt={profileForm.name || 'Profile'} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-4xl text-[var(--color-text)]">
                    {(profileForm.name || 'A').charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-display text-[2rem] leading-none text-[var(--color-text)]">
                  {profileForm.name || t('accountPage.yourAccount')}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-faint)]">
                  {profileForm.email || t('accountPage.emailFallback')}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-faint)]">
                  {profileForm.phone_number || t('accountPage.phoneFallback')}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="metric-tile">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                  {t('common.role')}
                </p>
                <p className="mt-4 text-lg font-semibold capitalize text-[var(--color-text)]">
                  {t(`common.roles.${user?.role || 'member'}`)}
                </p>
              </div>

              {sellerUser ? (
                <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] p-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                    {t('accountPage.separation')}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">
                    {t('accountPage.separationCopy')}
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
