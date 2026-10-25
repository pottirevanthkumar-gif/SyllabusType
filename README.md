# SyllabusType
SyllabusType: a typing practice web app that turns university syllabus content into daily typing practice. Type. Revise. Retain.
# SyllabusType

**Type. Revise. Retain.**

SyllabusType is a typing practice web app for university students. Instead of
typing generic sentences, students type their own syllabus content: definitions,
formulas and code snippets, while getting live feedback on speed and accuracy.

Built as a prototype for a university hackathon.

## Live demo
https://syllabustype.netlify.app/

## The problem
Typing practice and academic revision are usually separate activities. Students
practise on unrelated text, while syllabus material stays unused as practice content.

## Our solution
One practice session with two goals: build typing fluency and revisit course content.

## Features
- Syllabus pathways: browse by branch, semester, subject and module
- Practice modes: definition, formula, code and short answer
- Live typing feedback: WPM, accuracy, errors and time
- Results with mistake review
- Revisit queue for difficult passages
- Progress dashboard with topic-wise history
- Faculty content hub: add passages and move them through Draft, Review and Approved

## How it works
Choose, Type, Review, Revisit.

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS
- Recharts
- Browser localStorage for progress (no backend in this prototype)

## Run locally
npm install
npm run dev

## Notes
- This is a prototype with sample syllabus content.
- Typing metrics are practice signals, not proof of exam mastery.
- Student progress is stored only in the user's own browser.
