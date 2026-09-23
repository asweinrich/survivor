'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckIcon, PlusIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import ContestantProfile from '../components/ContestantProfile';
import EmojiPicker from 'emoji-picker-react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { LargeTribeBadges, TribeBadges } from '@/lib/utils/tribes'

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  img: string; // This should match the field in your database
  inPlay: boolean;
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};

export default function Draft() {
  const [draftPicks, setDraftPicks] = useState<number[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);

  // New state for confirmation modal & final submission
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selectedSoleSurvivor, setSelectedSoleSurvivor] = useState<number | null>(null);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [otpError, setOtpError] = useState('');

  const [smsConsent, setSmsConsent] = useState(false);

  const router = useRouter();

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Form state
  const [form, setForm] = useState({
    phone: '',
    name: '',
    tribeName: '',
    emoji: '',
    color: getRandomColor(),
  });

  const season = 51;

  //disable draft until it opens
  const status = true;

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Fetch contestants and tribes when the component mounts
  useEffect(() => {
    async function fetchContestants() {
      const res = await fetch(`/api/cast/${season}`);
      const data = await res.json();
      setContestants(data);
    }
    fetchContestants();

    async function fetchTribes() {
      const res = await fetch(`/api/show-tribes/${season}`);
      const data = await res.json();
      setTribes(data);
    }
    fetchTribes();
  }, []);

  useEffect(() => {
    if (modalVisible || confirmationModalVisible) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalVisible, confirmationModalVisible]);

  function formatTribeBadges(tribeIds: number[]) {
    return tribeIds.map((id) => {
      const tribe = tribes.find((t) => t.id === id);
      if (!tribe) return null;
      return (
        <span
          key={id}
          className="inline-block p-1.5 tracking-wider leading-none rounded-full me-1 lowercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.2),
            color: tribe.color,
          }}
        >
          {tribe.name}
        </span>
      );
    });
  }

  function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Function to close the default modal (for viewing contestant profile)
  const closeModal = () => {
    setModalVisible(false);
    setFocusContestant(0);
  };

  // Function to open the contestant profile modal
  const activateModal = (id: number) => {
    setFocusContestant(id);
    setModalVisible(true);
  };

  // Function to update draft picks (toggle selection)
  const updatePicks = (id: number) => {
    if (draftPicks.length >= 6 && !draftPicks.includes(id)) {
      alert("Only 6 Tribe Members allowed. Remove one of your picks to select a different contestant.");
      return;
    }
    setDraftPicks((prevPicks) => {
      if (prevPicks.includes(id)) {
        return prevPicks.filter((pick) => pick !== id);
      } else {
        return [...prevPicks, id];
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiClick = (emoji: any) => {
    setForm((prev) => ({ ...prev, emoji: emoji.emoji }));
    setEmojiPickerVisible(false);
  };

  // Modified handleSubmit: instead of immediately submitting, show confirmation modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draftPicks.length !== 6) {
      alert("Please select exactly 6 contestants.");
      return;
    }
    // Open the confirmation modal
    setConfirmationModalVisible(true);
  };

  // Final submission: reorder tribe picks, submit to API, and then redirect
  const handleFinalSubmit = async () => {
    if (!selectedSoleSurvivor) return;
    setFinalSubmitting(true);
    setOtpError('');
    const newTribeArray = [selectedSoleSurvivor, ...draftPicks.filter(id => id !== selectedSoleSurvivor)];
    const data = {
      phone: form.phone,
      verificationToken,
      name: form.name,
      tribeName: form.tribeName,
      color: form.color,
      emoji: form.emoji,
      season,
      tribeArray: newTribeArray,
      smsConsent,
    };

    try {
      const response = await fetch('/api/add-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setOtpError(errorData?.message || `Server returned ${response.status}`);
        setFinalSubmitting(false);
        return;
      }
      const result = await response.json();
      router.push(`/your-tribe/${result.tribeId || result.id}`);
    } catch (error) {
      console.error('Error during final submission:', error);
      setOtpError('An error occurred during final submission.');
      setFinalSubmitting(false);
    }
  };

  const handleSendCode = async () => {
    if (!form.phone) return;
    setSendingCode(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/phone/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to send code');
      }
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.phone || otpCode.length !== 6) return;
    setVerifyingCode(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: otpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Invalid or expired code');
      }
      setOtpVerified(true);
      setVerificationToken(data.verificationToken);
    } catch (err: any) {
      setOtpVerified(false);
      setVerificationToken('');
      setOtpError(err.message || 'Invalid or expired code');
    } finally {
      setVerifyingCode(false);
    }
  };


  // Helper to get the names of drafted contestants (for the textarea preview)
  const getTribeNames = () => {
    if(!status) {
      return "Drafting is unavailable until after the first episode airs."
    } else {
      return draftPicks
      .map((id) => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.name : '';
      })
      .join(', ');
    }

  };

  // Compute the drafted contestants array for use in the confirmation modal
  const draftedContestants = draftPicks
    .map((id) => contestants.find((c) => c.id === id))
    .filter((c): c is Contestant => Boolean(c));

  function getFirstName(fullName: string): string {
    return fullName.trim().split(' ')[0];
  }

  // Format a raw/E.164 phone number as (XXX) XXX-XXXX for display only.
  // Storage/submission always uses the raw digits / E.164 format.
  function formatPhoneDisplay(phone: string): string {
    const digits = phone.replace(/\D/g, '').slice(-10); // last 10 digits, ignores leading +1
    if (digits.length !== 10) return phone; // fallback if incomplete/invalid
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // NEW: Build groups by tribe
  const contestantsByTribe = useMemo(() => {
    const tribeIdSet = new Set(tribes.map((t) => t.id));
    const groups: Array<{ tribe: Tribe | null; contestants: Contestant[] }> = [];

    // Tribes in the order returned by /api/show-tribes
    tribes.forEach((t) => {
      const list = contestants
        .filter((c) => Array.isArray(c.tribes) && c.tribes.includes(t.id))
        .sort((a, b) => a.name.localeCompare(b.name));

      groups.push({ tribe: t, contestants: list });
    });

    // Unassigned group: contestants with no tribes OR tribe ids not in the tribes list
    const unassigned = contestants
      .filter((c) => {
        const ids = Array.isArray(c.tribes) ? c.tribes : [];
        if (ids.length === 0) return true;
        return ids.every((id) => !tribeIdSet.has(id));
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (unassigned.length > 0) {
      groups.push({ tribe: null, contestants: unassigned });
    }

    return groups;
  }, [contestants, tribes]);

  const renderContestantCard = (contestant: Contestant) => (
    <div
      key={contestant.id}
      className={`flex flex-row items-center p-2 mb-0.5 bg-stone-800 border-4 rounded-xl ${
        draftPicks.includes(contestant.id) ? 'border-green-500' : 'border-stone-700'
      } ${!contestant.inPlay ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div
        className={`flex items-center mx-auto justify-center w-20 h-20 p-1 rounded-full border-4 ${
          draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
        } relative`}
      >
        <img
          src={`/imgs/${contestant.img}.png`}
          alt={contestant.name}
          className="w-full object-cover rounded-full overflow-hidden"
        />
      </div>

      {/* Contestant Info */}
      <div className="flex flex-col flex-grow ps-1">
        <div className="flex flex-row items-center px-2 mb-1">
          <span className="uppercase text-lg font-lostIsland tracking-wider leading-tight">
            {contestant.name}
          </span>
        </div>
        <div className="flex flex-row items-center px-2">
          <IdentificationIcon
            className="w-7 h-7 text-stone-300 stroke-2 me-1.5 hover:cursor-pointer"
            onClick={() => activateModal(contestant.id)}
          />
          <TribeBadges tribeIds={[Number(contestant.tribes)]} tribes={tribes as Tribe[]} />
        </div>
        <div className="flex flex-row">
          {!contestant.inPlay && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded lowercase">
              Contestant Not in play
            </span>
          )}
        </div>
      </div>

      <div className="mx-1">
        <span
          className={`border-4 rounded-lg w-12 h-12 flex justify-center items-center ${
            draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
          } bg-stone-800 ${!contestant.inPlay ? 'cursor-not-allowed opacity-60' : 'hover:cursor-pointer'}`}
          onClick={() => {
            if (contestant.inPlay) {
              updatePicks(contestant.id);
            }
          }}
        >
          {draftPicks.includes(contestant.id) ? (
            <CheckIcon className="w-8 h-8 stroke-3 text-green-400" />
          ) : (
            <PlusIcon className="w-8 h-8 stroke-3 text-stone-400" />
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png"
            alt="Survivor Background"
            fill
            style={{ objectFit: 'cover' }}
            className=""
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)",
            }}
          ></div>
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Draft your Tribe
        </h1>
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`}
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      { !status ? (
        // If status is false, show the disabled message.
        <div className="max-w-6xl mx-auto px-4 my-24">
          <div className="bg-stone-800 border border-stone-700 text-center p-4 rounded-lg">
            <p className="text-lg font-lostIsland tracking-wider">
              The drafting period for Season {season} not started yet. Tribes can be drafted anytime during the week between the 1st and 2nd episodes. Visit the cast page to to see Season 51's contestants.
            </p>
          </div>
        </div>
      ) : (

        <div className="max-w-6xl mx-auto">
          <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider">
            <p className="mb-3">
              Enter your contact and tribe information in the form below. Make sure you've read the{' '}
              <a href="/how-to-play" className="text-orange-400 hover:text-orange-600">
                rules
              </a>{' '}
              and{' '}
              <a href="/faq" className="text-orange-400 hover:text-orange-600">
                FAQ
              </a>{' '}
              before drafting your tribe! Tribes cannot be updated after you submit your picks.
            </p>
            <p className="mb-3">
              Tap
              <PlusIcon className="inline mx-2 w-6 h-6 stroke-3 text-stone-400 border-2 p-0.5 rounded border-stone-400" />to
              add a contestant to your tribe. Tap it again to remove them.
            </p>
            <p className="mb-3">
              Pick <span className="text-lg">6</span> Contestants. When you submit, you will be prompted to select one
              of them as your Sole Survivor.
            </p>
            <p className="">
              Tap the
              <IdentificationIcon className="inline mx-1.5 w-5 h-5 stroke-2 text-stone-300" />icon to view additional
              contestant details.
            </p>
            <p className="mt-3 text-green-200 text-center bg-green-800 rounded-lg p-1 leading-tight">
              Tribe drafting is open until Wednesday, September 30th at 5:00 PM PST.
            </p>
          </div>

          {/* Form Section */}
          <form className="mb-0 bg-stone-900 rounded-lg font-lostIsland tracking-wider uppercase" onSubmit={handleSubmit}>
            <div className="flex flex-col px-2">
              <div className="mb-4 px-4">
                <label htmlFor="phone" className="block text-lg mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 555-5555"
                  className="w-full p-2 bg-stone-700 rounded text-lg"
                  value={form.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4 px-4">
                <label htmlFor="name" className="block text-lg mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-2 bg-stone-700 rounded text-lg"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-start mb-4 px-4">
                <div className="w-12 me-4">
                  <label htmlFor="emoji" className="block text-lg mb-1.5">
                    Icon
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="emoji"
                      name="emoji"
                      maxLength={1}
                      className="w-full p-2 bg-stone-700 rounded text-lg text-center"
                      value={form.emoji}
                      readOnly
                      onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
                      required
                    />
                  </div>
                  {emojiPickerVisible && (
                    <div className="absolute z-50 mt-2">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <div className="w-12 me-4">
                  <label htmlFor="color" className="block text-lg mb-1.5">
                    Color
                  </label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    placeholder="#77c471"
                    className="w-full p-1.5 bg-stone-700 rounded text-lg h-11"
                    value={form.color}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="tribeName" className="block text-lg mb-1.5">
                    Tribe Name
                  </label>
                  <input
                    type="text"
                    id="tribeName"
                    name="tribeName"
                    className="w-full p-2 bg-stone-700 rounded text-lg"
                    value={form.tribeName}
                    onChange={handleInputChange}
                    maxLength={23}
                    required
                  />
                </div>
              </div>

              <div className="relative mt-4">
                <p className="mb-6 text-xl mx-auto text-center">Contestant List</p>

                {/* NEW: Grouped by tribe (no tribe headers) */}
                <div className="px-1 mb-8 space-y-6">
                  {contestantsByTribe.map(({ tribe, contestants }) => (
                    <div key={tribe?.id ?? 'unassigned'}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {contestants.map(renderContestantCard)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 p-4 pt-3 bg-stone-700 rounded-t-xl mx-1" style={{"zIndex": 50}}>
                  <div className="mb-2">
                    <div className="flex flex-row justify-around items-center mb-3">
                      <label htmlFor="tribeArray" className="flex grow text-lg leading-tight">
                        Your Tribe ({draftPicks.length})
                      </label>
                      <button
                        type="button"
                        disabled={draftPicks.length === 0}
                        onClick={() => setDraftPicks([])}
                        className={`leading-none px-3 py-1.5 lowercase w-auto rounded ${
                          draftPicks.length > 0
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Clear Selection
                      </button>
                    </div>
                    <textarea
                      id="tribeArray"
                      name="tribeArray"
                      className="w-full tracking-wide p-2 bg-stone-600 rounded font-inter resize-none"
                      value={getTribeNames()}
                      readOnly
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !form.phone ||
                      !form.name ||
                      !form.tribeName ||
                      !form.color ||
                      !form.emoji ||
                      !status ||
                      draftPicks.length !== 6

                    }
                    className={`w-full py-2 rounded text-lg uppercase ${
                      form.phone &&
                      form.name &&
                      form.tribeName &&
                      form.color &&
                      form.emoji &&
                      status &&
                      draftPicks.length === 6
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Confirmation Modal */}
          {confirmationModalVisible && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-100"
              onClick={() => setConfirmationModalVisible(false)}
            >
              <div
                className="bg-stone-800 rounded-lg p-4 w-full max-w-3xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl tracking-wider text-center uppercase mb-2 font-lostIsland">Confirm Your Tribe</h2>
                <div className="mb-3 pb-3 border-b ">
                  <p className="flex items-center mb-3">
                    <span
                      style={{ backgroundColor: form.color }}
                      className="inline-block w-12 h-12 text-center text-2xl p-2 rounded-full"
                    >{form.emoji}</span>
                    <span className="text-2xl ms-3 font-lostIsland tracking-wider">{form.tribeName}</span>
                  </p>
                  <p className="font-lostIsland tracking-wider text-xl leading-none ps-1">
                    {form.name}
                  </p>
                  <p className="font-lostIsland tracking-wider text-lg leading-tight opacity-80 ps-1">
                    {formatPhoneDisplay(form.phone)}
                  </p>
                </div>
                <div>
                  <p className="mb-4 font-lostIsland uppercase tracking-wider text-center text-xl">Choose Your Sole Survivor</p>
                  <div className="grid grid-cols-3 gap-2">
                    {draftedContestants.map((contestant) => (
                      <div
                        key={contestant.id}
                        className="w-28 h-28 relative"
                        onClick={() => {
                          if (contestant.inPlay) setSelectedSoleSurvivor(contestant.id);
                        }}
                      >
                        <div

                          className={`cursor-pointer p-2 border-4 rounded-full flex flex-col items-center ${
                            !contestant.inPlay ? 'opacity-60 pointer-events-none' : ''
                          } ${
                            selectedSoleSurvivor === contestant.id ? 'border-yellow-400' : 'border-stone-600'
                          }`}
                        >
                          <img
                            src={`/imgs/${contestant.img}.png`}
                            alt={contestant.name}
                            className="w-24 object-cover rounded-full"
                          />

                        </div>
                        <p
                          className={`absolute -bottom-1 left-0 border-2 border-stone-800 right-0 rounded-lg text-stone-100 bg-stone-700 text-stone-100 text-center font-lostIsland tracking-wider text-lg leading-tight p-1 ${
                            selectedSoleSurvivor === contestant.id ? 'bg-yellow-500' : 'bg-stone-700'
                          }`}
                          style={{ textShadow: "2px 2px 1px rgba(0, 0, 0, 1)" }}
                        >
                          {getFirstName(contestant.name)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phone Verification Section */}
                <div className="mt-4 pt-4 border-t border-stone-600">
                  <p className="mb-3 font-lostIsland uppercase tracking-wider text-center text-lg">
                    Verify Your Phone Number
                  </p>

                  {otpVerified ? (
                    <div className="p-2 rounded border font-lostIsland border-green-700 bg-green-900/30 text-green-200 text-center tracking-wider lowercase">
                      ✓ Phone verified
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-stone-300 tracking-wider leading-tight text-center mb-3">
                        We'll text a 6-digit code to {formatPhoneDisplay(form.phone)} to confirm it's really you.
                      </p>

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          disabled={sendingCode || !form.phone}
                          className={`w-full py-2 rounded text-lg uppercase font-lostIsland tracking-wider ${
                            sendingCode || !form.phone
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {sendingCode ? 'Sending...' : 'Send Code'}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(e.target.value.replace(/\D/g, ''));
                              setOtpError('');
                            }}
                            className="px-4 py-2 rounded text-black font-lostIsland w-full text-center text-xl tracking-widest lowercase"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verifyingCode || otpCode.length !== 6}
                            className={`w-full py-2 rounded text-lg uppercase font-lostIsland tracking-wider ${
                              verifyingCode || otpCode.length !== 6
                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {verifyingCode ? 'Verifying...' : 'Verify Code'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={sendingCode}
                            className="text-xs text-orange-400 hover:text-orange-300 tracking-wider underline"
                          >
                            {sendingCode ? 'Resending...' : "Didn't get it? Resend code"}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {otpError && (
                    <div className="mt-2 p-2 rounded border border-red-700 bg-red-900/30 text-red-200 text-sm text-center">
                      {otpError}
                    </div>
                  )}
                </div>

                {/* SMS Consent Section (required for Twilio A2P 10DLC registration) 
                <div className="flex items-start mt-4">
                  <input
                    type="checkbox"
                    id="smsConsent"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="me-3 mt-1 h-8 w-8"
                  />
                  <label htmlFor="smsConsent" className="font-inter text-sm tracking-wider leading-tight">
                    By checking this box, I consent to receive text messages from Survivor Fantasy
                    at the phone number provided, including a draft confirmation, weekly recaps, and pick em reminders. Message and data rates may apply. You can use STOP to opt out. Consent is not a condition of participation.
                  </label>
                </div>*/}

                {/* New Checkbox Section */}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="acknowledge"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="me-3 h-8 w-8"
                  />
                  <label htmlFor="acknowledge" className="font-inter text-sm tracking-wider leading-tight">
                    I acknowledge I need to pay Andrew my tribe's entry fee by Wednesday September 30th, 2026 @ 5:00 PM PT or else my tribe will be ineligible for prizes in this season's competition
                  </label>
                </div>

                <div className="flex flex-col mt-4 tracking-wider font-lostIsland text-xl space-y-4">
                  <button
                    onClick={() => setConfirmationModalVisible(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Edit Tribe
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={!selectedSoleSurvivor || finalSubmitting || !acknowledged || !otpVerified}
                    className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
                      (!selectedSoleSurvivor || finalSubmitting || !acknowledged || !otpVerified) &&
                      "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Confirm Submission
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Modal for Contestant Profile */}
          {modalVisible && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
              onClick={closeModal}
            >
              <div
                className="w-full max-w-3xl h-[92%] overflow-y-scroll bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="text-stone-400 hover:text-stone-200 absolute top-3 right-4"
                  onClick={closeModal}
                >
                  ✕
                </button>
                <ContestantProfile contestantId={focusContestant} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}