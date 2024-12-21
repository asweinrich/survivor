"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.contestant.createMany({
                        data: [
                            { name: 'Bianca Roses', img: '48/', hometown: 'Arlington, Virginia', season: 48, profession: 'PR Consultant', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Cedrek McFadden', img: '48/Cedrek McFadden', hometown: 'Greenville, South Carolina', season: 48, profession: 'Surgeon', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Charity Nelms', img: '48/Charity Nelms', hometown: 'St. Petersburg, Florida', season: 48, profession: 'Flight Attendant', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Chrissy Sarnowsky', img: '48/Chrissy Sarnowsky', hometown: 'Chicago, Illinois', season: 48, profession: 'Firefighter', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'David Kinne', img: '48/David Kinne', hometown: 'Long Beach, California', season: 48, profession: 'Stunt Performer', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Eva Erickson', img: '48/Eva Erickson', hometown: 'Providence, Rhode Island', season: 48, profession: 'Grad Student', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Joe Hunter', img: '48/Joe Hunter', hometown: 'Sacramento, California', season: 48, profession: 'Fire Captain', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Justin Pioppi', img: '48/Justin Pioppi', hometown: 'Revere, Maine', season: 48, profession: 'Pizza Restaurant Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Kamilla Karthigesu', img: '48/Kamilla Karthigesu', hometown: 'San Francisco, California', season: 48, profession: 'Discord Engineer', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Kevin Leung', img: '48/Kevin Leung', hometown: 'San Francisco, California', season: 48, profession: 'Finance Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Kyle Fraser', img: '48/Kyle Fraser', hometown: 'Brooklyn, New York', season: 48, profession: 'Judicial Law Clerk', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Mary Zheng', img: '48/Mary Zheng', hometown: 'Philadelphia, Pennslyvania', season: 48, profession: 'Social Worker', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Mitch Guerra', img: '48/Mitch Guerra', hometown: 'Waco, Texas', season: 48, profession: 'PE Teacher', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Saiounia Hughley', img: '48/Saiounia Hughley', hometown: 'Philadelphia, Pennslyvania', season: 48, profession: 'Brand Strategist', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Shauhin Davari', img: '48/Shauhin Davari', hometown: 'Costa Mesa, California', season: 48, profession: 'College Speaking Instructor', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Star Toomey', img: '48/Star Toomey', hometown: 'Dacula, Georgia', season: 48, profession: 'Unknown', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Stephanie Berger', img: '48/Stephanie Berger', hometown: 'Brooklyn, New York', season: 48, profession: 'Product Manager', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                            { name: 'Thomas Krottinger', img: '48/Thomas Krottinger', hometown: 'Los Angeles, California', season: 48, profession: 'VP in A&R', tribes: [1], inPlay: true, madeMerge: null, top3: null, soleSurvivor: null, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, advantages: 0, episodes: 0, madeFire: false },
                        ],
                    })];
                case 1:
                    _a.sent();
                    console.log('Seed data for Contestants added!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
