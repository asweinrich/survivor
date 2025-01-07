'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, PlusIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import ContestantProfile from '../components/ContestantProfile';
import EmojiPicker from 'emoji-picker-react';



type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  img: string; // This should match the field in your database
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

  // Form state
  const [form, setForm] = useState({
    email: '',
    phone: '',
    name: '',
    tribeName: '',
    emoji: '',
    color: '#000000',
  });

  const season = 48;

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Fetch contestants when the season changes
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
    if (modalVisible) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalVisible]);

  function formatTribeBadges(tribeIds: number[]) {
    return tribeIds.map((id) => {
      const tribe = tribes.find((t) => t.id === id);
      if (!tribe) return null;

      return (
        <span
          key={id}
          className="inline-block px-2 py-0.5 tracking-wider rounded-full text-white me-1 lowercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.3), // Transparent background
            color: tribe.color, // Solid text color
          }}
        >
          {tribe.name}
        </span>
      );
    });
  }

  function hexToRgba(hex: string, alpha: number): string {
    // Remove the '#' if present
    const cleanHex = hex.replace('#', '');
    // Convert hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setFocusContestant(0);
  };

  // Function to close the modal
  const activateModal = (id: number) => {
    setFocusContestant(id);
    setModalVisible(true);
  };

  //Fucntion to update draft picks
  const updatePicks = (id: number) => {
    if (draftPicks.length >= 6 && !draftPicks.includes(id)) {
      alert("Only 6 Tribe Members allowed. Remove one of your picks to select a different contestant.");
      return;
    }

    setDraftPicks((prevPicks) => {
      if (prevPicks.includes(id)) {
        // Remove the ID if it's already in the array
        return prevPicks.filter((pick) => pick !== id);
      } else {
        // Add the ID to the array
        return [...prevPicks, id];
      }
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tribeArray = draftPicks
      .map((id) => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.id : null;
      })
      .filter((id) => id !== null); // Filter out nulls

    const data = {
      email: form.email,
      name: form.name,
      tribeName: form.tribeName,
      color: form.color,
      emoji: form.emoji,
      season,
      tribeArray,
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
        const errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }

      const result = await response.json();
      alert('Submission successful!');
      console.log('Response from server:', result);
    } catch (error) {
      console.error('Error during submission:', error);
      alert('An error occurred while submitting the form.');
    }
  };


  const getTribeNames = () => {
    return draftPicks
      .map((id) => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.name : '';
      })
      .join(', ');
  };



  const handleEmojiClick = (emoji: any) => {
    setForm((prev) => ({ ...prev, emoji: emoji.emoji }));
    setEmojiPickerVisible(false); // Close picker after selection
  };


  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-stone-100 p-4 font-survivor tracking-wider">Draft your tribe</h1>

        {/* Form Section */}
        <form className="mb-8 p-4 bg-stone-800 rounded-lg font-lostIsland tracking-wider uppercase" onSubmit={handleSubmit}>
          <div className="flex flex-col p-1">
            <div className="mb-4">
              <label htmlFor="email" className="block text-lg mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-2 bg-stone-700 rounded text-lg"
                value={form.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-lg mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full p-2 bg-stone-700 rounded text-lg"
                value={form.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
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
              />
            </div>
            <div className="flex justify-start mb-4">
              <div className="w-12 me-4">
                <label htmlFor="emoji" className="block text-lg mb-1.5">
                  Emoji
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="emoji"
                    name="emoji"
                    maxLength={2}
                    className="w-full p-2 bg-stone-700 rounded text-lg text-center"
                    value={form.emoji}
                    readOnly // Make it read-only to force users to use the picker
                    onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
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
                  className="w-full p-1.5 bg-stone-700 rounded text-lg h-11"
                  value={form.color}
                  onChange={handleInputChange}
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
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="tribeArray" className="block text-lg leading-tight">
                Your Tribe Members
              </label>
              <p className="opacity-60 mb-1.5">Select 6 Contestants Below</p>
              <textarea
                id="tribeArray"
                name="tribeArray"
                rows={3}
                className="w-full p-2 bg-stone-700 rounded text-lg"
                value={getTribeNames()} // Dynamically update based on draftPicks
                readOnly
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={draftPicks.length !== 6} // Disable until exactly 6 picks are selected
            className={`mt-4 w-full py-2 rounded text-lg ${
              draftPicks.length === 6
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </form>



        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        
          {contestants.map((contestant) => (
          <div
            key={contestant.id}
            className="flex flex-col items-center p-3 bg-stone-800 m-2 rounded-xl"
          >
            {/* Image */}
            <div 
              className={`flex items-center justify-center w-28 h-28 rounded-full border-4 mb-3 hover:cursor-pointer ${
                draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
              } relative mb-2`}
              onClick={() => updatePicks(contestant.id)}
            >
              <img
                src={`/imgs/${contestant.img}.png`}
                alt={contestant.name}
                className="h-24 w-24 object-cover rounded-full overflow-hidden"
              />
              <span 
                className={`absolute -bottom-1 -right-1 border-4 rounded-full w-10 h-10 flex justify-center items-center ${
                  draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
                } bg-stone-800`}
              >
                {draftPicks.includes(contestant.id) ? (
                  <CheckIcon className="w-5 h-5 stroke-4 text-green-400" />
                ) : (
                  <PlusIcon className="w-5 h-5 stroke-4 text-stone-400" />
                )}
              </span>

            </div>

            {/* Survivor Name and Info */}
            <div className="flex flex-col flex-grow">
              <div className="flex flex-row items-center px-1">
                <span className="h-12 text-lg uppercase font-lostIsland tracking-wider leading-tight">{contestant.name}</span>
              </div>
              <div className="flex flex-row items-center px-1">
                <IdentificationIcon className="w-6 h-6 stroke-2 me-1.5 hover:cursor-pointer" onClick={() => activateModal(contestant.id)} />
                <span className="">{formatTribeBadges(contestant.tribes)}</span>
              </div>
              <div className="flex items-center">
                
              </div>
            </div>

            
          </div>
          ))}
        </div>



        {/* Modal */}
        {modalVisible && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-3xl h-[92%] overflow-y-scroll bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland"
              onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside
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
    </div>
  );
}