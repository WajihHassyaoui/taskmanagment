export const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Don't count the days, make the days count. - Muhammad Ali",
  "Productivity is never an accident. It is always the result of a commitment to excellence. - Paul J. Meyer",
  "Focus on being productive instead of busy. - Tim Ferriss",
  "Your mind is for having ideas, not holding them. - David Allen",
  "The secret of getting ahead is getting started. - Mark Twain",
  "Quality is not an act, it is a habit. - Aristotle",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work. - Stephen King",
  "Action is the foundational key to all success. - Pablo Picasso",
  "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
  "Discipline is choosing between what you want now and what you want most. - Abraham Lincoln",
  "Either you run the day or the day runs you. - Jim Rohn",
  "It is not the mountain we conquer but ourselves. - Edmund Hillary",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Everything you've ever wanted is on the other side of fear. - George Addair",
  "Done is better than perfect. - Sheryl Sandberg",
  "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
  "Small progress is still progress. - Anonymous",
  "Stay hungry, stay foolish. - Steve Jobs",
  "Work hard in silence, let your success be your noise. - Frank Ocean",
  "The goal is not to be better than the other man, but your previous self. - Dalai Lama",
  "You don't have to see the whole staircase, just take the first step. - Martin Luther King Jr.",
  "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
  "If you want to live a happy life, tie it to a goal, not to people or things. - Albert Einstein",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Obstacles are those frightful things you see when you take your eyes off your goal. - Henry Ford",
  "It always seems impossible until it's done. - Nelson Mandela",
  "If you can dream it, you can do it. - Walt Disney",
  "Keep your eyes on the stars, and your feet on the ground. - Theodore Roosevelt",
  "Opportunities don't happen, you create them. - Chris Grosser",
  "To-do lists help us manage our lives, not just our tasks. - Anonymous"
];

export const getDailyQuote = () => {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
};
