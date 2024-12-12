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
                            { name: 'Rachel LaMont', img: '47/Rachel LaMont', hometown: 'Southfield, Michigan', season: '47', profession: 'Graphic Designer', tribes: ['Gata', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 3, hiddenIdols: 1, tribalWins: 3, rewards: 3, removed: false },
                            { name: 'Sam Phelan', img: '47/Sam Phelan', hometown: 'Chicago, Illinois', season: '47', profession: 'Sports Reporter', tribes: ['Gata', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 3, rewards: 5, removed: false },
                            { name: 'Sue Smey', img: '47/Sue Smey', hometown: 'Putnam Valley, New York', season: '47', profession: 'Flight School Owner', tribes: ['Tuku', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 0, rewards: 3, removed: false },
                            { name: 'Teeny Chirichillo', img: '47/Teeny Chirichillo', hometown: 'Manahawkin, New Jersey', season: '47', profession: 'Freelance Writer', tribes: ['Lavo', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 5, removed: false },
                            { name: 'Genevieve Mushaluk', img: '47/Genevieve Mushaluk', hometown: 'Winnipeg, Manitoba', season: '47', profession: 'Corporate Lawyer', tribes: ['Lavo', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 2, hiddenIdols: 0, tribalWins: 1, rewards: 5, removed: false },
                            { name: 'Andy Rueda', img: '47/Andy Rueda', hometown: 'Brooklyn, New York', season: '47', profession: 'AI Research Assistant', tribes: ['Gata', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, removed: false },
                            { name: 'Caroline Vidmar', img: '47/Caroline Vidmar', hometown: 'Chicago, Illinois', season: '47', profession: 'Strategy Consultant', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, removed: false },
                            { name: 'Kyle Ostwald', img: '47/Kyle Ostwald', hometown: 'Cheboygan, Michigan', season: '47', profession: 'Construction Worker', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 4, hiddenIdols: 0, tribalWins: 1, rewards: 4, removed: false },
                            { name: 'Gabe Ortis', img: '47/Gabe Ortis', hometown: 'Baltimore, Maryland', season: '47', profession: 'Radio Host', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 1, rewards: 1, removed: false },
                            { name: 'Solomon "Sol" Yi', img: '47/Solomon Yi', hometown: 'Norwalk, Connecticut', season: '47', profession: 'Medical Device Sales', tribes: ['Lavo', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 2, removed: false },
                            { name: 'Sierra Wright', img: '47/Sierra Wright', hometown: 'Phoenixville, Pennslyvania', season: '47', profession: 'Nurse', tribes: ['Gata', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, removed: false },
                            { name: 'Tiyana Hallums', img: '47/Tiyana Hallums', hometown: 'Oahu, Hawaii', season: '47', profession: 'Flight Attendant', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, removed: false },
                            { name: 'Rome Cooney', img: '47/Rome Cooney', hometown: 'Phoenix, Arizona', season: '47', profession: 'E-Sports Commentator', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 1, tribalWins: 1, rewards: 0, removed: false },
                            { name: 'Anika Dhar', img: '47/Anika Dhar', hometown: 'Los Angeles, California', season: '47', profession: 'Marketing Manager', tribes: ['Gata'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 3, rewards: 0, removed: false },
                            { name: 'Kishan Patel', img: '47/Kishan Patel', hometown: 'San Francisco, California', season: '47', profession: 'Emergency Room Doctor', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, removed: false },
                            { name: 'Aysha Welch', img: '47/Aysha Welch', hometown: 'Houston, Texas', season: '47', profession: 'IT Consultant', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, removed: false },
                            { name: 'Terran "TK" Foster', img: '47/TK Foster', hometown: 'Washington D.C.', season: '47', profession: 'Athlete Marketing Manager', tribes: ['Tuku'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, removed: false },
                            { name: 'Jon Lovett', img: '47/Jon Lovett', hometown: 'Los Angeles, California', season: '47', profession: 'Podcast Host', tribes: ['Gata'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, removed: false },
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
