import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.contestant.createMany({
    data: [
      { name: 'Rachel LaMont', img: '47/Rachel LaMont', hometown: 'Southfield, Michigan', season: 47, profession: 'Graphic Designer', tribes: [1, 4], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 3, hiddenIdols: 1, tribalWins: 3, rewards: 3, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Sam Phelan', img: '47/Sam Phelan', hometown: 'Chicago, Illinois', season: 47, profession: 'Sports Reporter', tribes: [1, 4], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 3, rewards: 5, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Sue Smey', img: '47/Sue Smey', hometown: 'Putnam Valley, New York', season: 47, profession: 'Flight School Owner', tribes: [3, 4], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 0, rewards: 3, advantages: 0, episodes: 0, madeFire: false,  },
      { name: 'Teeny Chirichillo', img: '47/Teeny Chirichillo', hometown: 'Manahawkin, New Jersey', season: 47, profession: 'Freelance Writer', tribes: [2, 4], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 5, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Genevieve Mushaluk', img: '47/Genevieve Mushaluk', hometown: 'Winnipeg, Manitoba', season: 47, profession: 'Corporate Lawyer', tribes: [2, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 2, hiddenIdols: 0, tribalWins: 1, rewards: 5, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Andy Rueda', img: '47/Andy Rueda', hometown: 'Brooklyn, New York', season: 47, profession: 'AI Research Assistant', tribes: [1, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Caroline Vidmar', img: '47/Caroline Vidmar', hometown: 'Chicago, Illinois', season: 47, profession: 'Strategy Consultant', tribes: [3, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Kyle Ostwald', img: '47/Kyle Ostwald', hometown: 'Cheboygan, Michigan', season: 47, profession: 'Construction Worker', tribes: [3, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 4, hiddenIdols: 0, tribalWins: 1, rewards: 4, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Gabe Ortis', img: '47/Gabe Ortis', hometown: 'Baltimore, Maryland', season: 47, profession: 'Radio Host', tribes: [3, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 1, rewards: 1, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Sol Yi', img: '47/Solomon Yi', hometown: 'Norwalk, Connecticut', season: 47, profession: 'Medical Device Sales', tribes: [2, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 2, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Sierra Wright', img: '47/Sierra Wright', hometown: 'Phoenixville, Pennslyvania', season: 47, profession: 'Nurse', tribes: [1, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Tiyana Hallums', img: '47/Tiyana Hallums', hometown: 'Oahu, Hawaii', season: 47, profession: 'Flight Attendant', tribes: [3, 4], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, advantages: 0, episodes: 0, madeFire: false },
      { name: 'Rome Cooney', img: '47/Rome Cooney', hometown: 'Phoenix, Arizona', season: 47, profession: 'E-Sports Commentator', tribes: [2], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 1, tribalWins: 1, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Anika Dhar', img: '47/Anika Dhar', hometown: 'Los Angeles, California', season: 47, profession: 'Marketing Manager', tribes: [1], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 3, rewards: 0, advantages: 0, episodes: 0, madeFire: false,  },
      { name: 'Kishan Patel', img: '47/Kishan Patel', hometown: 'San Francisco, California', season: 47, profession: 'Emergency Room Doctor', tribes: [2], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Aysha Welch', img: '47/Aysha Welch', hometown: 'Houston, Texas', season: 47, profession: 'IT Consultant', tribes: [2], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'TK Foster', img: '47/TK Foster', hometown: 'Washington D.C.', season: 47, profession: 'Athlete Marketing Manager', tribes: [3], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Jon Lovett', img: '47/Jon Lovett', hometown: 'Los Angeles, California', season: 47, profession: 'Podcast Host', tribes: [1], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },

      { name: 'Bianca Roses', img: '48/', hometown: 'Arlington, Virginia', season: 48, profession: 'PR Consultant', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Cedrek McFadden', img: '48/Cedrek McFadden', hometown: 'Greenville, South Carolina', season: 48, profession: 'Surgeon', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Charity Nelms', img: '48/Charity Nelms', hometown: 'St. Petersburg, Florida', season: 48, profession: 'Flight Attendant', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Chrissy Sarnowsky', img: '48/Chrissy Sarnowsky', hometown: 'Chicago, Illinois', season: 48, profession: 'Firefighter', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'David Kinne', img: '48/David Kinne', hometown: 'Long Beach, California', season: 48, profession: 'Stunt Performer', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Eva Erickson', img: '48/Eva Erickson', hometown: 'Providence, Rhode Island', season: 48, profession: 'Grad Student', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Joe Hunter', img: '48/Joe Hunter', hometown: 'Sacramento, California', season: 48, profession: 'Fire Captain', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Justin Pioppi', img: '48/Justin Pioppi', hometown: 'Revere, Maine', season: 48, profession: 'Pizza Restaurant Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Kamilla Karthigesu', img: '48/Kamilla Karthigesu', hometown: 'San Francisco, California', season: 48, profession: 'Discord Engineer', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Kevin Leung', img: '48/Kevin Leung', hometown: 'San Francisco, California', season: 48, profession: 'Finance Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Kyle Fraser', img: '48/Kyle Fraser', hometown: 'Brooklyn, New York', season: 48, profession: 'Judicial Law Clerk', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Mary Zheng', img: '48/Mary Zheng', hometown: 'Philadelphia, Pennslyvania', season: 48, profession: 'Social Worker', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Mitch Guerra', img: '48/Mitch Guerra', hometown: 'Waco, Texas', season: 48, profession: 'PE Teacher', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Saiounia Hughley', img: '48/Saiounia Hughley', hometown: 'Philadelphia, Pennslyvania', season: 48, profession: 'Brand Strategist', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Shauhin Davari', img: '48/Shauhin Davari', hometown: 'Costa Mesa, California', season: 48, profession: 'College Speaking Instructor', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Star Toomey', img: '48/Star Toomey', hometown: 'Dacula, Georgia', season: 48, profession: 'Unknown', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Stephanie Berger', img: '48/Stephanie Berger', hometown: 'Brooklyn, New York', season: 48, profession: 'Product Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },
      { name: 'Thomas Krottinger', img: '48/Thomas Krottinger', hometown: 'Los Angeles, California', season: 48, profession: 'VP in A&R', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false  },

    

    ],
  });

  console.log('Seed data for Contestants added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
