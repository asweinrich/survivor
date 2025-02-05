'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, PlusIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import ContestantProfile from '../components/ContestantProfile';
import EmojiPicker from 'emoji-picker-react';
import Image from "next/image";



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
    email: '',
    phone: '',
    name: '',
    tribeName: '',
    emoji: '',
    color: getRandomColor(),
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
          className="inline-block p-1.5 tracking-wider leading-none rounded-full me-1 lowercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.2), // Transparent background
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
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png" // Replace with your background image path
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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">Draft your Tribe</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`} // Replace with your Survivor logo path
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider">
          
          <p className="mb-3">
            Enter your contact and tribe information in the form below
          </p>

           <p className="mb-3">
            Tap 
            <PlusIcon className="inline mx-2 w-6 h-6 stroke-3 text-stone-400 border-2 p-0.5 rounded border-stone-400 " />
            to add a contestant to your tribe. Tap it again to remove them
          </p>

          <p className="mb-3">
            Pick <span className="text-lg">6</span> Contestants. When you submit, you will be prompted to selected one of them as your Sole Survivor. 
          </p>

          <p className="">
            Tap the 
            <IdentificationIcon className="inline mx-1.5 w-5 h-5 stroke-2 text-stone-300" />
            icon to view additional contestant details
          </p>

          



        </div>


        {/* Form Section */}
        <form className="mb-0 bg-stone-900 rounded-lg font-lostIsland tracking-wider uppercase" onSubmit={handleSubmit}>
          <div className="flex flex-col px-2">
            <div className="mb-4 px-4">
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
                required
              />
            </div>
            <div className="mb-4 px-4">
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
                    readOnly // Make it read-only to force users to use the picker
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

              <p className="mb-6 text-xl mx-auto text-center underline">Contestant List</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1 mb-8">
          
                {contestants.map((contestant) => (
                <div
                  key={contestant.id}
                  className={`flex flex-row items-center p-2 mb-0.5 bg-stone-800 border-4 rounded-xl ${
                    draftPicks.includes(contestant.id) ? 'border-green-500' : 'border-stone-700'
                  }`}
                >
                  {/* Image */}
                  <div 
                    className={`flex items-center mx-auto justify-center w-20 h-20 p-1 rounded-full border-4  ${
                      draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
                    } relative`}
                    
                  >
                    <img
                      src={`/imgs/${contestant.img}.png`}
                      alt={contestant.name}
                      className="w-full object-cover rounded-full overflow-hidden"
                    />


                  </div>

                  {/* Survivor Name and Info */}
                  <div className="flex flex-col flex-grow ps-1">
                    <div className="flex flex-row items-center px-2 mb-1">
                      <span className="uppercase text-lg font-lostIsland tracking-wider leading-tight">{contestant.name}</span>
                    </div>
                    <div className="flex flex-row items-center px-2">
                      <IdentificationIcon className="w-7 h-7 text-stone-300 stroke-2 me-1.5 hover:cursor-pointer" onClick={() => activateModal(contestant.id)} />
                      <span className="">{formatTribeBadges(contestant.tribes)}</span>
                    </div>
                    
                  </div>

                  <div className="mx-1 hover:cursor-pointer">
                    <span 
                      className={`border-4 rounded-lg w-12 h-12 flex justify-center items-center ${
                        draftPicks.includes(contestant.id) ? 'border-green-400' : 'border-stone-400'
                      } bg-stone-800`}
                      onClick={() => updatePicks(contestant.id)}
                    >
                      {draftPicks.includes(contestant.id) ? (
                        <CheckIcon className="w-8 h-8 stroke-3 text-green-400" />
                      ) : (
                        <PlusIcon className="w-8 h-8 stroke-3 text-stone-400" />
                      )}
                    </span>
                  </div>

                  
                </div>
                ))}
              </div>

              <div className="sticky bottom-0 p-4 pt-3 bg-stone-700 rounded-t-xl mx-1">

                <div className="mb-2">
                  <div className="flex flex-row justify-around items-center mb-3">
                    <label htmlFor="tribeArray" className="flex grow text-lg leading-tight">
                      Your Tribe ({draftPicks.length})
                    </label>

                    <button
                      type="button"
                      disabled={draftPicks.length === 0}
                      onClick={() => setDraftPicks([])} // Clear the tribe selection
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
                    value={getTribeNames()} // Dynamically update based on draftPicks
                    readOnly
                    rows={3} 
                  />
                </div>

                
                <button
                  type="submit"
                  disabled={
                    !form.email ||
                    !form.phone ||
                    !form.name ||
                    !form.tribeName ||
                    !form.color ||
                    !form.emoji ||
                    draftPicks.length !== 6
                  }
                  className={`w-full py-2 rounded text-lg uppercase ${
                    form.email &&
                    form.phone &&
                    form.name &&
                    form.tribeName &&
                    form.color &&
                    form.emoji &&
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