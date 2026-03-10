import './About.css'

import SplitText from '../../components/SplitText'
import FadeContent from '@/components/FadeContent'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const items = [
  {
    value: "item-1",
    trigger: "what is this app?",
    content:
      "this is a hub for my personal editing effects and animation presets i use in my videos. if you like my editing style, or just want some cool presets, use this app! :D",
  },
  {
    value: "item-2",
    trigger: "there are alot of bugs!!!",
    content:
      "im still working on it :( sorry",
  },
  {
    value: "item-3",
    trigger: "how did i make this?",
    content:
      "this app was made with tauri (Rust), typescript + react, shadcnui, and reactbits",
  },
]

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};



export default function About() {
  return (
    <div className='about-page-wrapper'>

              <SplitText
          text="about"
          className="about-welcome-message"
          delay={20}
          duration={1.5}
          ease="elastic.out(1, 0.3)"
          splitType="chars"
          from={{ opacity: 0, y: 5 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      <div className='accordion-container'>
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="max-w-lg"
        >
          {items.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}