export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: string;
}

export const QUESTION_POOL: Question[] = [
  { id: 'math1', question: 'What is 15 + 27?', options: ['32', '42', '45', '39'], correct: '42' },
  { id: 'math2', question: 'What is 120 divided by 5?', options: ['20', '24', '25', '30'], correct: '24' },
  { id: 'math3', question: 'If a rectangle has a length of 10cm and width of 5cm, what is its area?', options: ['15cm²', '50cm²', '30cm²', '25cm²'], correct: '50cm²' },
  { id: 'eng1', question: 'Which word is a synonym of "Happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correct: 'Joyful' },
  { id: 'eng2', question: 'Identify the verb in: "The quick brown fox jumps over the lazy dog."', options: ['Quick', 'Fox', 'Jumps', 'Over'], correct: 'Jumps' },
  { id: 'eng3', question: 'What is the opposite of "Ancient"?', options: ['Old', 'Antique', 'Modern', 'Historic'], correct: 'Modern' },
  { id: 'logic1', question: 'If Alice is taller than Bob, and Bob is taller than Charlie, who is the shortest?', options: ['Alice', 'Bob', 'Charlie', 'Equal'], correct: 'Charlie' },
  { id: 'logic2', question: 'Which number comes next in the sequence: 2, 4, 8, 16, ...?', options: ['20', '24', '32', '64'], correct: '32' },
  { id: 'sci1', question: 'What is the main source of energy for the Earth?', options: ['Moon', 'Sun', 'Mars', 'Stars'], correct: 'Sun' },
  { id: 'sci2', question: 'Which planet is known as the "Red Planet"?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 'Mars' },
  { id: 'sci3', question: 'What gas do humans need to breathe in to survive?', options: ['Carbon Dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], correct: 'Oxygen' },
  { id: 'gk1', question: 'How many colors are there in a rainbow?', options: ['5', '6', '7', '8'], correct: '7' },
  { id: 'gk2', question: 'Who is known as the "Father of Computers"?', options: ['Bill Gates', 'Steve Jobs', 'Charles Babbage', 'Alan Turing'], correct: 'Charles Babbage' },
];
