import React, { useRef, useState } from 'react';
import { Mail, UserPlus, X, CheckCircle } from 'lucide-react';
import { useSession } from '@/sessionManager/SessionContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Teams: React.FC = () => {
  const { theme } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddEmail = (value?: string) => {
    const email = (value ?? emailInput).trim();
    if (!email) return;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (emails.includes(email)) {
      setError('This email is already added.');
      return;
    }
    setEmails([...emails, email]);
    setEmailInput('');
    setError('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      handleAddEmail();
    } else if (e.key === 'Backspace' && !emailInput && emails.length) {
      setEmails(emails.slice(0, -1));
    }
  };

  const handleSendInvite = () => {
    if (emails.length === 0) {
      setError('Add at least one email to send invites.');
      return;
    }
    setSent(true);
    setTimeout(() => {
      setModalOpen(false);
      setEmails([]);
      setSent(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center rounded-3xl justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-dark' : 'bg-gradient-to-br from-white to-white'}`}>
      <div className={`w-full max-w-2xl mx-auto rounded-3xl  p-8 flex flex-col items-center ${theme === 'dark' ? 'bg-dark/90' : 'bg-white/90'}`}>
        <div className="flex items-center gap-3 mb-4 w-full text-center items-center justify-center">
          <div className="flex items-center gap-2">
            <UserPlus size={32} className="text-primary dark:text-white" />
            <h1 className="text-3xl font-bold text-blue-700 dark:text-white">Teams</h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-secondary-300 mb-8 text-center">Manage your team members and invite new collaborators.</p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Mail size={20} /> Invite Members
        </button>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn ${theme === 'dark' ? 'bg-dark/95' : 'bg-white'}`}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-2 flex items-center gap-2">
              <UserPlus size={24} /> Invite Team Members
            </h2>
            <p className="text-gray-500 dark:text-secondary-300 mb-4">Enter email addresses to invite. Press <span className="font-semibold">Enter</span> or <span className="font-semibold">Comma</span> to add each email.</p>
            <div className="flex flex-col items-center w-full mb-2">
              <div className={`flex flex-wrap items-center gap-2 w-full px-2 py-2 border-2 rounded-xl focus-within:ring-2 transition-all ${theme === 'dark' ? 'bg-dark border-gray-700 focus-within:ring-primary' : 'bg-white border-gray-200 focus-within:ring-blue-400'}`}>
                {emails.map(email => (
                  <span key={email} className="flex items-center bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
                    <Mail size={16} className="mr-1" />
                    {email}
                    <button
                      className="ml-2 text-primary/60 hover:text-red-500"
                      onClick={() => handleRemoveEmail(email)}
                      aria-label={`Remove ${email}`}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  type="email"
                  className={`flex-1 min-w-[120px] bg-transparent border-none outline-none text-base py-1 px-2 ${theme === 'dark' ? 'text-white placeholder:text-secondary-400' : 'text-black placeholder:text-secondary-400'}`}
                  placeholder={emails.length ? '' : 'Enter email address'}
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setError(''); }}
                  onKeyDown={handleInputKeyDown}
                  aria-label="Add email"
                />
              </div>
              {error && <div className="text-red-500 text-sm mt-2 w-full text-center">{error}</div>}
            </div>
            <button
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 mt-4 ${emails.length ? 'bg-primary hover:bg-primary-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
              onClick={handleSendInvite}
              disabled={!emails.length}
            >
              {sent ? (<><CheckCircle className="mr-2" size={20} />Invites Sent!</>) : 'Send Invite'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams; 