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
var players = [
    { email: 'akkia15@gmail.com', tribeName: 'AssUpInTheWell' },
    { email: 'fishbourneellie@gmail.com', tribeName: 'NoOneCheered4MyCoconut' },
    { email: 'vvacknitz@gmail.com', tribeName: 'Toriko' },
    { email: 'joshbrigance@hotmail.com', tribeName: 'Joshiko' },
    { email: 'catherinermarshall@gmail.com', tribeName: 'Cathemeral Tribe' },
    { email: 'slunbeck@gmail.com', tribeName: 'LunBecks' },
    { email: 'cassandrew25@gmail.com', tribeName: 'Cassaka' },
    { email: 'haileytannenbaum493@gmail.com', tribeName: 'Hailstorm' },
    { email: 'lindsey.swiatek@gmail.com', tribeName: 'Ling' },
    { email: 'jessica.homet@gmail.com', tribeName: 'Jesak\'aa' },
    { email: 'asweinrich@gmail.com', tribeName: 'Werd Na' },
    { email: 'jjg999@gmail.com', tribeName: 'Jdogarundi' },
    { email: 'shelbynb94@gmail.com', tribeName: 'Shebalba' },
    { email: 'enation114@gmail.com', tribeName: 'Bula' },
    { email: 'axiedompier@yahoo.com', tribeName: 'Ax-ah' },
    { email: 'kristimichelleking@gmail.com', tribeName: 'Jeffrey Lee Probst' },
    { email: 'tjfking@gmail.com', tribeName: 'Paku Paku' },
    { email: 'nickgraham@gmail.com', tribeName: 'Nikuru Tribe' },
    { email: 'sigotron@gmail.com', tribeName: 'Joel Probst\'s Chosen' },
    { email: 'lorenamartinez500@gmail.com', tribeName: 'LaLoreChosen' },
    { email: 'suegupta425@gmail.com', tribeName: 'Suevivor' },
    { email: 'claudebullock@gmail.com', tribeName: 'Babu' },
    { email: 'julialeelewis@gmail.com', tribeName: 'JuJu' },
    { email: 'joel.swiatek@gmail.com', tribeName: 'Jolagu' },
    { email: 'charquach@gmail.com', tribeName: 'Lordcharquad' },
    { email: 'kyle.d.heimbach@gmail.com', tribeName: 'Heimheim' },
    { email: 'natidibbern@gmail.com', tribeName: 'Natika' },
    { email: 'juanjo.neri@gmail.com', tribeName: 'Kumachikitopitito' },
];
function seedPlayers() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, players_1, player, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding players...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 9]);
                    _i = 0, players_1 = players;
                    _a.label = 2;
                case 2:
                    if (!(_i < players_1.length)) return [3 /*break*/, 5];
                    player = players_1[_i];
                    return [4 /*yield*/, prisma.player.create({
                            data: {
                                email: player.email,
                                tribeName: player.tribeName,
                                color: '#77c471', // Default color
                                name: player.tribeName, // Using tribe name as default name
                                passwordHash: '', // Placeholder value for password hash
                            },
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Seeding complete.');
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error seeding players:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, prisma.$disconnect()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
seedPlayers();
