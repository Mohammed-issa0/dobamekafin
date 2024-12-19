import { FaShoppingCart } from 'react-icons/fa';
import {motion} from "framer-motion"
export default function CtaBtn(){
    return(
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{scale: .95}}
            animate={{scale: [.95 ,1.05, .95]}}
            transition={{repeat:Infinity ,duration:.8 }}
            className="bg-white text-sport-dark hover:bg-sport-light font-bold py-4 px-8 rounded-full text-lg inline-flex items-center gap-2"
          >
            <FaShoppingCart className="w-5 h-5" />
            اطلبه الآن
          </motion.button>
    )
}