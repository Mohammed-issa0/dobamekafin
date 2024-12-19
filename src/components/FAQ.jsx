import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from "lucide-react";
import React ,{useState} from 'react';

  const listAnimation = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };
const faqs = [
  {
    question: "كيف أضمن جودة المنتج؟",
    answer: "كل كيس من دوباميكافين يأتي مع شهادة ضمان أصالة وجودة معتمدة."
  },
  {
    question: "هل يمكنني استبدالها أو إرجاعها؟",
    answer: "نعم، نوفر ضمان استبدال أو إرجاع خلال 30 يومًا من تاريخ الشراء."
  },
  {
    question: "هل تناسب القهوة الاستخدام اليومي؟",
    answer: "بالتأكيد، تم تصميمها لتكون جزءًا من روتينك اليومي."
  },
  {
    question: "هل تأتي مع ضمان؟",
    answer: "نعم، لدينا ضمان كامل على جودة المنتج."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(null);
  return (
    <div id="faq" className="py-16 bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ threshold: 0.7 }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.3 },
          },
        }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          variants={listAnimation}
          className="text-3xl font-bold text-center text-primary drop-shadow-sm mb-12"
        >
          الأسئلة الشائعة
        </motion.h2>

        <motion.div variants={listAnimation} className="space-y-4 transition">
          {faqs.map((faq, index) => (
            <motion.div
              variants={listAnimation}
              key={index}
              className="border border-primary rounded-lg"
            >
              <motion.button
                variants={listAnimation}
                transition={{ duration: 0.3 }}
                className="w-full text-right px-6 py-4 flex items-center justify-between transition hover:shadow-lg "
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <motion.span
                  transition={{ duration: 0.3 }}
                  className="font-semibold text-lg text-black drop-shadow-sm transition"
                >
                  {faq.question}
                </motion.span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-black drop-shadow-sm transition" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-black transition" />
                )}
              </motion.button>
              {openIndex === index && (
                <div className="px-6 pb-4 transition">
                  <p className="text-gray-600 transition py-3">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}