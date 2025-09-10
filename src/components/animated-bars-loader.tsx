import { motion } from 'framer-motion';

export default function AnimatedDotsLoader() {
    return (
        <div
            className="w-full flex items-center justify-center">
            <motion.div
                className="flex items-end justify-center gap-2"
                variants={{
                    initial: {
                        transition: {
                            staggerChildren: 0.2,
                        },
                    },
                    animate: {
                        transition: {
                            staggerChildren: 0.2,
                        },
                    },
                }}
                initial='initial'
                animate='animate'
                role='status'
                aria-label='Loading'>
                <MotionDot />
                <MotionDot />
                <MotionDot />
            </motion.div>
        </div>
    );
}

function MotionDot() {
    return (
        <motion.span
            className='mb-6 w-3 h-3 rounded-full bg-current'
            variants={{
                initial: {
                    y: '0%',
                },
                animate: {
                    y: '100%',
                },
            }}
            transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
            }}
        />
    );
}
