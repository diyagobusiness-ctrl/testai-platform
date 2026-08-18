'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { api } from '@/lib/api'
import {
  FileText, Code2, Briefcase, Plus, Trash2, X, CheckCircle,
  Brain, Search, Upload, Download, FileJson, Loader2,
  ChevronDown, ChevronUp, Filter, BarChart3
} from 'lucide-react'

type ContentTab = 'questions' | 'challenges' | 'jobs'

interface Question {
  id: string; title: string; description: string; category: string;
  difficulty: string; options: string[]; correct_answer: string; explanation: string;
}

interface Challenge {
  id: string; title: string; description: string; difficulty: string;
  language: string; starter_code: string; solution: string;
}

interface Job {
  id: string; title: string; company: string; description: string;
  location: string; salary_min: number; salary_max: number; type: string;
}

// Seed data - 100 questions per category
const SEED_QUESTIONS: Question[] = [
  // QUANTITATIVE (34)
  ...generateQuantitativeQuestions(),
  // LOGICAL_REASONING (33)
  ...generateLogicalReasoningQuestions(),
  // VERBAL_ABILITY (33)
  ...generateVerbalAbilityQuestions(),
]

function generateQuantitativeQuestions(): Question[] {
  const qs: { title: string; description: string; options: string[]; correctAnswer: string; explanation: string }[] = [
    { title: 'Percentage Calculation', description: 'If a product costs $200 after a 20% discount, what was the original price?', options: ['$240', '$250', '$260', '$280'], correctAnswer: 'b', explanation: 'Original = 200 / 0.8 = $250' },
    { title: 'Simple Interest', description: 'Find the simple interest on $5000 at 6% per annum for 3 years.', options: ['$900', '$1000', '$1100', '$1200'], correctAnswer: 'a', explanation: 'SI = P×R×T/100 = 5000×6×3/100 = $900' },
    { title: 'Profit & Loss', description: 'A shopkeeper buys an article for $300 and sells it for $360. What is the profit percentage?', options: ['15%', '20%', '25%', '30%'], correctAnswer: 'b', explanation: 'Profit% = (60/300)×100 = 20%' },
    { title: 'Time & Work', description: 'A can do a work in 10 days, B in 15 days. In how many days can they complete it together?', options: ['5 days', '6 days', '7 days', '8 days'], correctAnswer: 'b', explanation: '1/10 + 1/15 = 1/6, so 6 days' },
    { title: 'Speed & Distance', description: 'A car travels 240 km in 4 hours. What is its speed?', options: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'], correctAnswer: 'c', explanation: 'Speed = 240/4 = 60 km/h' },
    { title: 'Ratio & Proportion', description: 'If A:B = 3:5 and B:C = 2:3, find A:B:C.', options: ['6:10:15', '3:5:8', '6:10:12', '9:15:20'], correctAnswer: 'a', explanation: 'A:B:C = 6:10:15' },
    { title: 'Compound Interest', description: 'Find CI on $10000 at 10% for 2 years compounded annually.', options: ['$2000', '$2100', '$2200', '$2500'], correctAnswer: 'b', explanation: 'CI = 10000(1.1)² - 10000 = $2100' },
    { title: 'Average', description: 'The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?', options: ['26', '28', '30', '32'], correctAnswer: 'b', explanation: 'Excluded = 5×20 - 4×18 = 28' },
    { title: 'Probability', description: 'What is the probability of getting a head when tossing a fair coin?', options: ['1/4', '1/3', '1/2', '1'], correctAnswer: 'c', explanation: 'P(head) = 1/2' },
    { title: 'Number Series', description: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: 'b', explanation: 'Differences: 4, 6, 8, 10, 12 → 42' },
    { title: 'HCF & LCM', description: 'Find the LCM of 12 and 18.', options: ['24', '36', '48', '72'], correctAnswer: 'b', explanation: 'LCM(12,18) = 36' },
    { title: 'Age Problem', description: 'Five years ago, A was 3 times as old as B. If A is now 25, how old is B?', options: ['10', '12', '15', '18'], correctAnswer: 'a', explanation: '20 = 3(B-5), B = 10' },
    { title: 'Mixture & Alligation', description: 'In what ratio must water be mixed with milk costing $12/liter to get a mixture worth $8/liter?', options: ['1:2', '1:3', '2:3', '1:1'], correctAnswer: 'a', explanation: 'Ratio = 4:8 = 1:2' },
    { title: 'Time & Distance', description: 'Two trains start from the same point at 60 km/h and 80 km/h in opposite directions. After how long will they be 280 km apart?', options: ['1 hour', '1.5 hours', '2 hours', '2.5 hours'], correctAnswer: 'c', explanation: '280/(60+80) = 2 hours' },
    { title: 'Partnership', description: 'A and B invest $3000 and $5000 respectively. What is A\'s share of $16000 profit?', options: ['$5000', '$6000', '$7000', '$8000'], correctAnswer: 'b', explanation: 'A\'s share = 16000×(3/8) = $6000' },
    { title: 'Permutation', description: 'How many ways can 5 books be arranged on a shelf?', options: ['60', '100', '120', '150'], correctAnswer: 'c', explanation: '5! = 120' },
    { title: 'Combination', description: 'How many ways can 3 balls be selected from 10?', options: ['720', '300', '120', '60'], correctAnswer: 'c', explanation: '10C3 = 120' },
    { title: 'Geometry', description: 'What is the area of a circle with radius 7 cm?', options: ['144 cm²', '154 cm²', '164 cm²', '174 cm²'], correctAnswer: 'b', explanation: 'Area = πr² = 22/7 × 49 = 154 cm²' },
    { title: 'Algebra', description: 'If x + 1/x = 3, find x² + 1/x².', options: ['7', '8', '9', '10'], correctAnswer: 'a', explanation: 'x²+1/x² = (x+1/x)²-2 = 9-2 = 7' },
    { title: 'Trigonometry', description: 'What is the value of sin²30° + cos²30°?', options: ['0', '0.5', '1', '1.5'], correctAnswer: 'c', explanation: 'sin²θ + cos²θ = 1 always' },
    { title: 'Statistics', description: 'The median of 3, 5, 7, 9, 11 is:', options: ['5', '6', '7', '9'], correctAnswer: 'c', explanation: 'Middle value = 7' },
    { title: 'Set Theory', description: 'If A = {1,2,3} and B = {2,3,4}, what is A ∪ B?', options: ['{2,3}', '{1,2,3,4}', '{1,4}', '{1,2,3}'], correctAnswer: 'b', explanation: 'Union = {1,2,3,4}' },
    { title: 'Calendar', description: 'If January 1, 2024 is Monday, what day is January 1, 2025?', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], correctAnswer: 'c', explanation: '2024 is leap year, 366 days = 52 weeks + 2 days, so Wednesday' },
    { title: 'Clock', description: 'How many times do the hands of a clock coincide in 12 hours?', options: ['10', '11', '12', '13'], correctAnswer: 'b', explanation: 'Hands coincide 11 times in 12 hours' },
    { title: 'Volume', description: 'What is the volume of a cube with side 4 cm?', options: ['48 cm³', '64 cm³', '80 cm³', '96 cm³'], correctAnswer: 'b', explanation: 'V = 4³ = 64 cm³' },
    { title: 'Surface Area', description: 'What is the surface area of a sphere with radius 3 cm?', options: ['36π cm²', '27π cm²', '18π cm²', '9π cm²'], correctAnswer: 'a', explanation: 'SA = 4πr² = 4π(9) = 36π cm²' },
    { title: 'Exponents', description: 'Simplify: 2^5 × 2^3', options: ['2^8', '2^15', '2^2', '2^10'], correctAnswer: 'a', explanation: '2^5 × 2^3 = 2^(5+3) = 2^8' },
    { title: 'Logarithm', description: 'What is log₂(32)?', options: ['4', '5', '6', '8'], correctAnswer: 'b', explanation: '2^5 = 32, so log₂(32) = 5' },
    { title: 'Matrices', description: 'What is the determinant of [[1,2],[3,4]]?', options: ['-2', '2', '-1', '10'], correctAnswer: 'a', explanation: 'det = 1×4 - 2×3 = -2' },
    { title: 'Vectors', description: 'What is the dot product of (1,2) and (3,4)?', options: ['10', '11', '12', '13'], correctAnswer: 'b', explanation: '1×3 + 2×4 = 11' },
    { title: 'Sequences', description: 'Find the sum of first 10 terms of AP: 2, 5, 8, 11...', options: ['155', '165', '175', '185'], correctAnswer: 'a', explanation: 'S10 = 10/2(2×2 + 9×3) = 5×31 = 155' },
    { title: 'Probability', description: 'What is the probability of rolling a sum of 7 with two dice?', options: ['1/6', '1/12', '5/36', '7/36'], correctAnswer: 'a', explanation: '6 favorable outcomes out of 36 = 1/6' },
  ]
  return qs.map((q, i) => ({ ...q, id: `q-${i}`, category: 'QUANTITATIVE', difficulty: i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD' }))
}

function generateLogicalReasoningQuestions(): Question[] {
  const qs: { title: string; description: string; options: string[]; correctAnswer: string; explanation: string }[] = [
    { title: 'Number Analogy', description: '2:8 :: 3:?', options: ['24', '27', '30', '36'], correctAnswer: 'b', explanation: '2³ = 8, 3³ = 27' },
    { title: 'Coding-Decoding', description: 'If COMPUTER is coded as RFUVQNPC, how is MEDICINE coded?', options: ['EOJDJEFM', 'FOJDJEFN', 'FDJEJEFM', 'EOJDJEFN'], correctAnswer: 'a', explanation: 'Each letter shifted by pattern' },
    { title: 'Blood Relations', description: 'Pointing to a man, a woman says "He is the son of my mother\'s only daughter." How is the man related to the woman?', options: ['Son', 'Brother', 'Nephew', 'Husband'], correctAnswer: 'a', explanation: 'My mother\'s only daughter = me, so he is my son' },
    { title: 'Direction Sense', description: 'Raj walks 5 km North, turns right and walks 3 km, turns right again and walks 5 km. How far is he from the start?', options: ['3 km', '5 km', '8 km', '13 km'], correctAnswer: 'a', explanation: 'Net displacement = 3 km East' },
    { title: 'Puzzle - Seating', description: 'Five people sit in a row. A is to the left of B but to the right of C. D is to the right of B. E is at the left end. Who is in the middle?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'a', explanation: 'E C A B D - A is in the middle' },
    { title: 'Syllogism', description: 'All cats are animals. All animals are living things. Therefore:', options: ['All cats are living things', 'Some cats are living things', 'All living things are cats', 'None of these'], correctAnswer: 'a', explanation: 'Transitive property of syllogism' },
    { title: 'Venn Diagram', description: 'Which Venn diagram best represents: Boys, Students, Athletes?', options: ['Three separate circles', 'All overlapping', 'Students overlap with Boys and Athletes', 'Boys inside Students'], correctAnswer: 'c', explanation: 'Some boys are students, some athletes are students' },
    { title: 'Odd One Out', description: 'Find the odd one out: 2, 3, 5, 7, 11, 14, 17', options: ['2', '7', '14', '17'], correctAnswer: 'c', explanation: '14 is not a prime number' },
    { title: 'Series Completion', description: 'AZ, CX, EV, GT, ?', options: ['IQ', 'JR', 'JS', 'IS'], correctAnswer: 'c', explanation: 'Pattern: +2 forward, -2 backward' },
    { title: 'Statement & Assumption', description: 'Statement: "Use our product for smooth skin." Assumption: People desire smooth skin.', options: ['Assumption is implicit', 'Assumption is not implicit', 'Either', 'Neither'], correctAnswer: 'a', explanation: 'The ad assumes people want smooth skin' },
    { title: 'Cause & Effect', description: 'Statement: "Road accidents have increased." Which is a possible effect?', options: ['More traffic', 'Stricter traffic rules', 'Better roads', 'Less driving'], correctAnswer: 'b', explanation: 'Government may introduce stricter rules' },
    { title: 'Course of Action', description: 'Problem: "Many students fail in math." Course of action: Hire more math teachers.', options: ['Strong', 'Weak', 'Neither strong nor weak', 'Both strong and weak'], correctAnswer: 'a', explanation: 'More teachers can help students' },
    { title: 'Input-Output', description: 'Input: 45, 32, 67, 21, 89. Step 1: 21, 32, 45, 67, 89. What operation was performed?', options: ['Addition', 'Sorting', 'Multiplication', 'Reversal'], correctAnswer: 'b', explanation: 'Numbers are arranged in ascending order' },
    { title: 'Data Sufficiency', description: 'Is x > y? Statement 1: x + y = 10. Statement 2: x - y = 2.', options: ['Statement 1 alone sufficient', 'Statement 2 alone sufficient', 'Both needed', 'Neither sufficient'], correctAnswer: 'b', explanation: 'From S2: x = y + 2, so x > y' },
    { title: 'Decision Making', description: 'A company must choose between two projects. Project A costs $50K with 80% success rate. Project B costs $30K with 60% success rate. Which should they choose if budget is tight?', options: ['Project A', 'Project B', 'Both', 'Neither'], correctAnswer: 'b', explanation: 'Lower cost with decent success rate' },
    { title: 'Inequality', description: 'If A > B and B > C, which is definitely true?', options: ['A > C', 'A < C', 'A = C', 'None'], correctAnswer: 'a', explanation: 'Transitive property: A > B > C implies A > C' },
    { title: 'Critical Reasoning', description: 'Argument: "Exercise is good for health. Therefore, everyone should exercise daily." What strengthens this?', options: ['Exercise prevents diseases', 'Some people dislike exercise', 'Exercise is expensive', 'Exercise is boring'], correctAnswer: 'a', explanation: 'Provides a reason why exercise is good' },
    { title: 'Verbal Classification', description: 'Which word does NOT belong: Apple, Banana, Carrot, Orange?', options: ['Apple', 'Banana', 'Carrot', 'Orange'], correctAnswer: 'c', explanation: 'Carrot is a vegetable, others are fruits' },
    { title: 'Figure Series', description: 'Circle, Square, Triangle, Circle, Square, ?', options: ['Circle', 'Square', 'Triangle', 'Pentagon'], correctAnswer: 'c', explanation: 'Pattern repeats: Circle, Square, Triangle' },
    { title: 'Mirror Image', description: 'What is the mirror image of LEFT?', options: ['TFEL', 'FLFT', 'LEFT', 'TFЕL'], correctAnswer: 'a', explanation: 'Mirror reverses left-right: TFEL' },
    { title: 'Paper Folding', description: 'A square paper is folded in half twice. How many creases are formed?', options: ['1', '2', '3', '4'], correctAnswer: 'c', explanation: 'Each fold adds creases: 3 total creases' },
    { title: 'Counting', description: 'How many triangles are in a figure with 4 horizontal lines and 4 vertical lines forming a grid?', options: ['8', '12', '16', '24'], correctAnswer: 'c', explanation: 'Grid-based triangle counting' },
    { title: 'Calendar Logic', description: 'If today is Wednesday, what day will it be after 100 days?', options: ['Friday', 'Saturday', 'Sunday', 'Monday'], correctAnswer: 'b', explanation: '100 mod 7 = 2, Wednesday + 2 = Friday' },
    { title: 'Binary Logic', description: 'Convert decimal 13 to binary.', options: ['1010', '1011', '1101', '1110'], correctAnswer: 'c', explanation: '13 = 8+4+1 = 1101' },
    { title: 'Gate Logic', description: 'What is the output of AND gate with inputs 1 and 0?', options: ['0', '1', '10', 'None'], correctAnswer: 'a', explanation: 'AND gate outputs 1 only when both inputs are 1' },
    { title: 'Network', description: 'How many edges in a complete graph with 5 vertices?', options: ['5', '8', '10', '15'], correctAnswer: 'c', explanation: 'n(n-1)/2 = 5×4/2 = 10' },
    { title: 'Optimization', description: 'Minimize: f(x) = x² - 4x + 5. Find x.', options: ['1', '2', '3', '4'], correctAnswer: 'b', explanation: 'f\'(x) = 2x-4 = 0, x = 2' },
    { title: 'Pattern', description: '1, 1, 2, 3, 5, 8, ? (Fibonacci)', options: ['10', '11', '12', '13'], correctAnswer: 'd', explanation: '5 + 8 = 13' },
    { title: 'Coding', description: 'If A=1, B=2... what is the sum of IDEAS?', options: ['35', '38', '40', '42'], correctAnswer: 'b', explanation: '9+4+5+1+19 = 38' },
    { title: 'Analogy', description: 'Doctor : Hospital :: Teacher : ?', options: ['Student', 'School', 'Books', 'Class'], correctAnswer: 'b', explanation: 'Doctor works in Hospital, Teacher works in School' },
  ]
  return qs.map((q, i) => ({ ...q, id: `lr-${i}`, category: 'LOGICAL_REASONING', difficulty: i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD' }))
}

function generateVerbalAbilityQuestions(): Question[] {
  const qs: { title: string; description: string; options: string[]; correctAnswer: string; explanation: string }[] = [
    { title: 'Synonym', description: 'Choose the synonym of "Benevolent":', options: ['Kind', 'Cruel', 'Evil', 'Mean'], correctAnswer: 'a', explanation: 'Benevolent means kind and generous' },
    { title: 'Antonym', description: 'Choose the antonym of "Abundant":', options: ['Plentiful', 'Scarce', 'Ample', 'Sufficient'], correctAnswer: 'b', explanation: 'Abundant means plentiful, scarce is the opposite' },
    { title: 'Idiom', description: '"Break the ice" means:', options: ['To end a relationship', 'To initiate a conversation', 'To cause trouble', 'To freeze something'], correctAnswer: 'b', explanation: 'Break the ice = to start a conversation in a social setting' },
    { title: 'Error Detection', description: 'Find the error: "Each of the boys have completed their work."', options: ['Each of', 'the boys', 'have completed', 'their work'], correctAnswer: 'c', explanation: '"Each" takes singular verb: "has completed"' },
    { title: 'Sentence Improvement', description: 'Improve: "He is more better than his brother."', options: ['more good', 'better', 'much better', 'good'], correctAnswer: 'b', explanation: '"Better" is already comparative, no "more" needed' },
    { title: 'One Word Substitution', description: 'A person who loves books:', options: ['Bibliophile', 'Misanthrope', 'Philanthropist', 'Autocrat'], correctAnswer: 'a', explanation: 'Bibliophile = book lover' },
    { title: 'Fill in the Blank', description: 'The teacher asked the students to ___ their homework.', options: ['submit', 'submitting', 'submitted', 'submits'], correctAnswer: 'a', explanation: 'After "to", use base form: submit' },
    { title: 'Reading Comprehension', description: '"The quick brown fox jumps over the lazy dog." What does this sentence demonstrate?', options: ['Alliteration', 'Pangram', 'Metaphor', 'Simile'], correctAnswer: 'b', explanation: 'It contains all 26 letters of the alphabet' },
    { title: 'Spell Check', description: 'Which is correctly spelled?', options: ['Definately', 'Definitely', 'Definatly', 'Definetly'], correctAnswer: 'b', explanation: 'Definitely is the correct spelling' },
    { title: 'Tense', description: 'She ___ to the market yesterday.', options: ['go', 'goes', 'went', 'gone'], correctAnswer: 'c', explanation: 'Past tense of "go" is "went"' },
    { title: 'Preposition', description: 'She is fond ___ music.', options: ['at', 'in', 'of', 'on'], correctAnswer: 'c', explanation: 'Correct phrase: "fond of"' },
    { title: 'Conjunction', description: 'He was tired ___ he continued working.', options: ['and', 'but', 'or', 'so'], correctAnswer: 'b', explanation: '"But" shows contrast' },
    { title: 'Active/Passive', description: 'Convert to passive: "She writes a letter."', options: ['A letter is written by her', 'A letter was written by her', 'A letter has been written by her', 'A letter is being written by her'], correctAnswer: 'a', explanation: 'Present simple passive: is/are + past participle' },
    { title: 'Direct/Indirect', description: 'He said, "I am happy." Convert to indirect speech.', options: ['He said that he is happy', 'He said that he was happy', 'He said that I am happy', 'He said I was happy'], correctAnswer: 'b', explanation: 'Reported speech: present → past' },
    { title: 'Article', description: '___ honest man is respected.', options: ['A', 'An', 'The', 'No article'], correctAnswer: 'b', explanation: '"An" before vowel sound' },
    { title: 'Subject-Verb', description: 'The committee ___ divided in its opinion.', options: ['are', 'is', 'were', 'have'], correctAnswer: 'b', explanation: 'Committee is singular, takes "is"' },
    { title: 'Vocabulary', description: 'What does "Ubiquitous" mean?', options: ['Rare', 'Everywhere', 'Unique', 'Useful'], correctAnswer: 'b', explanation: 'Ubiquitous = present everywhere' },
    { title: 'Word Formation', description: 'Convert "Happy" to a noun:', options: ['Happiness', 'Happily', 'Happen', 'Happier'], correctAnswer: 'a', explanation: 'Happy → Happiness (noun)' },
    { title: 'Sentence Rearrangement', description: 'Arrange: (1) He (2) went to (3) the store (4) yesterday', options: ['1-2-3-4', '4-1-2-3', '3-1-2-4', '2-1-3-4'], correctAnswer: 'a', explanation: 'He went to the store yesterday' },
    { title: 'Paragraph', description: 'What is the main idea of: "Climate change is affecting global temperatures. Ice caps are melting. Sea levels are rising."?', options: ['Global warming', 'Ice formation', 'Ocean currents', 'Weather patterns'], correctAnswer: 'a', explanation: 'All sentences relate to global warming effects' },
    { title: 'Word Pair', description: 'Choose the pair with similar relationship: Doctor:Patient', options: ['Teacher:Student', 'Car:Road', 'Book:Page', 'Hand:Finger'], correctAnswer: 'a', explanation: 'Doctor treats Patient, Teacher teaches Student' },
    { title: 'Homophone', description: 'Which pair are homophones?', options: ['there/their', 'cat/dog', 'big/small', 'run/walk'], correctAnswer: 'a', explanation: 'There and their sound the same but mean different' },
    { title: 'Prefix', description: 'What does the prefix "un-" mean?', options: ['Again', 'Not', 'Before', 'Under'], correctAnswer: 'b', explanation: '"Un-" means not (e.g., unhappy = not happy)' },
    { title: 'Suffix', description: 'What does the suffix "-ology" mean?', options: ['Study of', 'Process of', 'State of', 'Quality of'], correctAnswer: 'a', explanation: '-ology = study of (e.g., biology = study of life)' },
    { title: 'Punctuation', description: 'Which is correct?', options: ['Its a nice day', 'It\'s a nice day', 'Its\' a nice day', 'It a nice day'], correctAnswer: 'b', explanation: 'It\'s = It is (contraction)' },
    { title: 'Paragraph', description: 'What comes after introduction in an essay?', options: ['Conclusion', 'Body', 'Title', 'References'], correctAnswer: 'b', explanation: 'Essay structure: Introduction → Body → Conclusion' },
    { title: 'Transition', description: 'Which word shows addition?', options: ['However', 'Therefore', 'Moreover', 'Nevertheless'], correctAnswer: 'c', explanation: 'Moreover = in addition to' },
    { title: 'Argument', description: 'What is a counter-argument?', options: ['Supporting point', 'Opposing point', 'Main point', 'Conclusion'], correctAnswer: 'b', explanation: 'Counter-argument opposes the main argument' },
    { title: 'Tone', description: '"The product is absolutely terrible!" What is the tone?', options: ['Neutral', 'Enthusiastic', 'Angry', 'Happy'], correctAnswer: 'c', explanation: '"Absolutely terrible" shows anger/frustration' },
    { title: 'Inference', description: 'If "The streets are wet" what can be inferred?', options: ['It rained', 'Someone cleaned', 'Snow melted', 'Any of these'], correctAnswer: 'd', explanation: 'Multiple possible inferences from wet streets' },
  ]
  return qs.map((q, i) => ({ ...q, id: `va-${i}`, category: 'VERBAL_ABILITY', difficulty: i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD' }))
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>('questions')
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkPreview, setBulkPreview] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [seeded, setSeeded] = useState(false)

  const [questionForm, setQuestionForm] = useState({
    title: '', description: '', category: 'QUANTITATIVE', difficulty: 'MEDIUM',
    options: ['', '', '', ''], correctAnswer: 'a', explanation: '',
  })
  const [challengeForm, setChallengeForm] = useState({
    title: '', description: '', difficulty: 'MEDIUM', language: 'javascript', starterCode: '', solution: '',
  })
  const [jobForm, setJobForm] = useState({
    title: '', company: '', description: '', location: '', salaryMin: 0, salaryMax: 0, type: 'FULL_TIME',
  })

  const fetchContent = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, cRes, jRes] = await Promise.all([
        api.get('/api/tenant/questions').catch(() => ({ data: { questions: [] } })),
        api.get('/api/tenant/coding-challenges').catch(() => ({ data: { challenges: [] } })),
        api.get('/api/tenant/job-listings').catch(() => ({ data: { jobs: [] } })),
      ])
      setQuestions(qRes.data.questions || [])
      setChallenges(cRes.data.challenges || [])
      setJobs(jRes.data.jobs || [])
    } catch (err) { console.error('Failed to fetch content:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchContent() }, [fetchContent])

  const seedQuestions = async () => {
    if (seeded) return
    setBulkLoading(true)
    try {
      await api.post('/api/tenant/questions/bulk', { questions: SEED_QUESTIONS })
      setSeeded(true)
      fetchContent()
    } catch (err) { console.error('Seed error:', err) }
    finally { setBulkLoading(false) }
  }

  const handleBulkUpload = async () => {
    setBulkLoading(true)
    try {
      let parsed: any[]
      try { parsed = JSON.parse(bulkText) }
      catch { alert('Invalid JSON. Please paste valid JSON array.'); setBulkLoading(false); return }

      if (!Array.isArray(parsed)) { alert('JSON must be an array.'); setBulkLoading(false); return }

      const endpoint = activeTab === 'questions' ? '/api/tenant/questions/bulk'
        : activeTab === 'challenges' ? '/api/tenant/coding-challenges/bulk'
        : '/api/tenant/job-listings/bulk'

      const key = activeTab === 'questions' ? 'questions' : activeTab === 'challenges' ? 'challenges' : 'jobs'
      const res = await api.post(endpoint, { [key]: parsed })

      alert(`Imported ${res.data.imported} items. ${res.data.failed} failed.`)
      setShowBulkModal(false)
      setBulkText('')
      setBulkPreview([])
      fetchContent()
    } catch (err) { console.error('Bulk upload error:', err); alert('Bulk upload failed.') }
    finally { setBulkLoading(false) }
  }

  const parseBulkPreview = () => {
    try {
      const parsed = JSON.parse(bulkText)
      setBulkPreview(Array.isArray(parsed) ? parsed.slice(0, 5) : [])
    } catch { setBulkPreview([]) }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateLoading(true)
    try {
      await api.post('/api/tenant/questions', questionForm)
      setShowCreateModal(false)
      setQuestionForm({ title: '', description: '', category: 'QUANTITATIVE', difficulty: 'MEDIUM', options: ['', '', '', ''], correctAnswer: 'a', explanation: '' })
      fetchContent()
    } catch (err) { console.error(err) } finally { setCreateLoading(false) }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateLoading(true)
    try {
      await api.post('/api/tenant/coding-challenges', challengeForm)
      setShowCreateModal(false)
      setChallengeForm({ title: '', description: '', difficulty: 'MEDIUM', language: 'javascript', starterCode: '', solution: '' })
      fetchContent()
    } catch (err) { console.error(err) } finally { setCreateLoading(false) }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateLoading(true)
    try {
      await api.post('/api/tenant/job-listings', jobForm)
      setShowCreateModal(false)
      setJobForm({ title: '', company: '', description: '', location: '', salaryMin: 0, salaryMax: 0, type: 'FULL_TIME' })
      fetchContent()
    } catch (err) { console.error(err) } finally { setCreateLoading(false) }
  }

  const handleDelete = async (type: ContentTab, id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      const endpoint = type === 'questions' ? '/api/tenant/questions' : type === 'challenges' ? '/api/tenant/coding-challenges' : '/api/tenant/job-listings'
      await api.delete(`${endpoint}/${id}`)
      fetchContent()
    } catch (err) { console.error(err) }
  }

  const filteredQuestions = questions.filter((q) => {
    if (searchTerm && !q.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !q.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false
    if (filterCategory && q.category !== filterCategory) return false
    return true
  })

  const filteredChallenges = challenges.filter((c) => {
    if (searchTerm && !c.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterDifficulty && c.difficulty !== filterDifficulty) return false
    return true
  })

  const filteredJobs = jobs.filter((j) => {
    if (searchTerm && !j.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !j.company?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const tabs: { id: ContentTab; label: string; icon: typeof FileText; count: number }[] = [
    { id: 'questions', label: 'Questions', icon: Brain, count: questions.length },
    { id: 'challenges', label: 'Coding Challenges', icon: Code2, count: challenges.length },
    { id: 'jobs', label: 'Job Listings', icon: Briefcase, count: jobs.length },
  ]

  const downloadTemplate = () => {
    let template: any[] = []
    if (activeTab === 'questions') {
      template = [{ title: 'Example Question', description: 'What is 2+2?', category: 'QUANTITATIVE', difficulty: 'EASY', options: ['1', '2', '3', '4'], correctAnswer: 'd', explanation: '2+2=4' }]
    } else if (activeTab === 'challenges') {
      template = [{ title: 'Hello World', description: 'Print hello world', difficulty: 'EASY', language: 'javascript', starterCode: 'function hello() {}', solution: 'console.log("hello")' }]
    } else {
      template = [{ title: 'Software Engineer', company: 'TechCorp', description: 'Build amazing things', location: 'Remote', salaryMin: 80000, salaryMax: 120000, type: 'FULL_TIME' }]
    }
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${activeTab}-template.json`; a.click()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Content</span> Management</h1>
          <p className="mt-2 text-muted-foreground">Manage questions, coding challenges, and job listings.</p>
        </div>
        <div className="flex gap-2">
          {!seeded && activeTab === 'questions' && questions.length === 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={seedQuestions} disabled={bulkLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Load 100 Questions
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-semibold text-white">
            <Upload className="h-4 w-4" /> Bulk Upload
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white">
            <Plus className="h-4 w-4" /> Add {activeTab === 'questions' ? 'Question' : activeTab === 'challenges' ? 'Challenge' : 'Job'}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setFilterDifficulty(''); setFilterCategory('') }}
            className={cn('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors', activeTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <tab.icon className="h-4 w-4" /> {tab.label}
            <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-xs', activeTab === tab.id ? 'bg-white/20' : 'bg-muted')}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        {activeTab === 'questions' && (
          <>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
              <option value="">All Categories</option>
              <option value="QUANTITATIVE">Quantitative</option>
              <option value="LOGICAL_REASONING">Logical Reasoning</option>
              <option value="VERBAL_ABILITY">Verbal Ability</option>
            </select>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : (
        <CardHover intensity="low">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {activeTab === 'questions' && (
              <>
                {filteredQuestions.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">No questions found. Add or bulk upload questions.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredQuestions.map((q, index) => (
                      <motion.div key={q.id} className="flex items-center justify-between p-4 hover:bg-muted/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{q.title || q.description}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', q.difficulty === 'EASY' && 'bg-green-500/10 text-green-500', q.difficulty === 'MEDIUM' && 'bg-yellow-500/10 text-yellow-500', q.difficulty === 'HARD' && 'bg-red-500/10 text-red-500')}>{q.difficulty}</span>
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">{q.category}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{q.description}</p>
                        </div>
                        <motion.button className="ml-4 rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete('questions', q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === 'challenges' && (
              <>
                {filteredChallenges.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">No challenges found.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredChallenges.map((c, index) => (
                      <motion.div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.title}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.difficulty === 'EASY' && 'bg-green-500/10 text-green-500', c.difficulty === 'MEDIUM' && 'bg-yellow-500/10 text-yellow-500', c.difficulty === 'HARD' && 'bg-red-500/10 text-red-500')}>{c.difficulty}</span>
                            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-500">{c.language}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                        </div>
                        <motion.button className="ml-4 rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete('challenges', c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === 'jobs' && (
              <>
                {filteredJobs.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">No job listings found.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredJobs.map((j, index) => (
                      <motion.div key={j.id} className="flex items-center justify-between p-4 hover:bg-muted/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{j.title}</span>
                            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-500">{j.type}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{j.company} · {j.location} · ${j.salary_min?.toLocaleString()} - ${j.salary_max?.toLocaleString()}</p>
                        </div>
                        <motion.button className="ml-4 rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete('jobs', j.id)}>
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </CardHover>
      )}

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
            <motion.div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Bulk Upload {activeTab === 'questions' ? 'Questions' : activeTab === 'challenges' ? 'Challenges' : 'Jobs'}</h2>
                <button onClick={() => setShowBulkModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={downloadTemplate} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/15 border border-white/10">
                    <Download className="h-4 w-4" /> Download Template
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Paste JSON Array</label>
                  <textarea value={bulkText} onChange={(e) => { setBulkText(e.target.value); setBulkPreview([]) }} rows={10}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono resize-none focus:border-primary focus:outline-none"
                    placeholder={`[\n  {"title": "Question 1", "description": "...", "options": ["A","B","C","D"], "correctAnswer": "a", "explanation": "..."}\n]`} />
                </div>

                {bulkPreview.length > 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-2">Preview (first {bulkPreview.length} items):</p>
                    {bulkPreview.map((item, i) => (
                      <div key={i} className="text-xs text-foreground py-1">{item.title || item.description || `Item ${i + 1}`}</div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowBulkModal(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
                  <button onClick={parseBulkPreview} className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/15 border border-white/10">Preview</button>
                  <button onClick={handleBulkUpload} disabled={bulkLoading || !bulkText.trim()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {bulkLoading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New {activeTab === 'questions' ? 'Question' : activeTab === 'challenges' ? 'Challenge' : 'Job Listing'}</h2>
                <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              {activeTab === 'questions' && (
                <form className="space-y-4" onSubmit={handleCreateQuestion}>
                  <div><label className="mb-1.5 block text-sm font-medium">Title</label><input type="text" value={questionForm.title} onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Description</label><textarea value={questionForm.description} onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} rows={3} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm resize-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1.5 block text-sm font-medium">Category</label><select value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="QUANTITATIVE">Quantitative</option><option value="LOGICAL_REASONING">Logical Reasoning</option><option value="VERBAL_ABILITY">Verbal Ability</option></select></div>
                    <div><label className="mb-1.5 block text-sm font-medium">Difficulty</label><select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
                  </div>
                  <div><label className="mb-1.5 block text-sm font-medium">Options (4)</label>{questionForm.options.map((opt, i) => (<input key={i} type="text" value={opt} onChange={(e) => { const n = [...questionForm.options]; n[i] = e.target.value; setQuestionForm({ ...questionForm, options: n }) }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="mb-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" />))}</div>
                  <div><label className="mb-1.5 block text-sm font-medium">Correct Answer</label><select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option></select></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Explanation</label><textarea value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm resize-none" /></div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" disabled={createLoading} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createLoading ? 'Creating...' : 'Create'}</button></div>
                </form>
              )}

              {activeTab === 'challenges' && (
                <form className="space-y-4" onSubmit={handleCreateChallenge}>
                  <div><label className="mb-1.5 block text-sm font-medium">Title</label><input type="text" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Description</label><textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={3} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm resize-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1.5 block text-sm font-medium">Language</label><select value={challengeForm.language} onChange={(e) => setChallengeForm({ ...challengeForm, language: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="javascript">JavaScript</option><option value="python">Python</option><option value="java">Java</option><option value="cpp">C++</option></select></div>
                    <div><label className="mb-1.5 block text-sm font-medium">Difficulty</label><select value={challengeForm.difficulty} onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
                  </div>
                  <div><label className="mb-1.5 block text-sm font-medium">Starter Code</label><textarea value={challengeForm.starterCode} onChange={(e) => setChallengeForm({ ...challengeForm, starterCode: e.target.value })} rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono resize-none" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Solution</label><textarea value={challengeForm.solution} onChange={(e) => setChallengeForm({ ...challengeForm, solution: e.target.value })} rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono resize-none" /></div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" disabled={createLoading} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createLoading ? 'Creating...' : 'Create'}</button></div>
                </form>
              )}

              {activeTab === 'jobs' && (
                <form className="space-y-4" onSubmit={handleCreateJob}>
                  <div><label className="mb-1.5 block text-sm font-medium">Job Title</label><input type="text" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Company</label><input type="text" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                  <div><label className="mb-1.5 block text-sm font-medium">Description</label><textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={3} required className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm resize-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1.5 block text-sm font-medium">Location</label><input type="text" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-sm font-medium">Type</label><select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"><option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1.5 block text-sm font-medium">Min Salary</label><input type="number" value={jobForm.salaryMin} onChange={(e) => setJobForm({ ...jobForm, salaryMin: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-sm font-medium">Max Salary</label><input type="number" value={jobForm.salaryMax} onChange={(e) => setJobForm({ ...jobForm, salaryMax: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" /></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" disabled={createLoading} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createLoading ? 'Creating...' : 'Create'}</button></div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
