'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPen, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { type getLessonById } from '~/utils/prompts/lessons';
import { useNotesPopoverStore } from '~/lib/store/notes-popover.store';

type Lesson = NonNullable<ReturnType<typeof getLessonById>>;

export function NotesPopover({ lesson }: { lesson: Lesson }) {
    const { isOpen, setIsOpen } = useNotesPopoverStore();

    return (
        <>
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                {!isOpen && <Dialog.Trigger asChild>
                    <Button className="fixed bottom-4 right-4 text-black border">Open Notes</Button>
                </Dialog.Trigger> }
                <AnimatePresence>
                    {isOpen && (
                        <Dialog.Portal forceMount>
                            <Dialog.Content asChild>
                                <motion.div
                                    className='fixed bottom-8 right-8 w-[400px] max-h-[300px] backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col border border-gray-200'
                                    initial={{ x: '100%', y: '100%', opacity: 0 }}
                                    animate={{ x: 0, y: 0, opacity: 1 }}
                                    exit={{ x: '100%', y: '100%', opacity: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}>
                                    <Dialog.Title className='m-4 mb-0 text-md font-medium'>
                                        Notes
                                    </Dialog.Title>
                                    <div
                                        contentEditable='true'
                                        className='m-4 mt-0 p-2 border border-transparent scrollbar-thin focus-visible:border-brand/40 focus-visible:outline-none rounded flex-grow overflow-y-auto'
                                        dangerouslySetInnerHTML={{
                                            __html: `<strong>Company:</strong> ${lesson.companyDescription} <br/><strong>Pain Points:</strong> ${lesson.primaryPainPoints} <br/><strong>Summary:</strong> ${lesson.summary} <br/><strong>Goal:</strong> ${lesson.goal}`,
                                        }}
                                    />
                                    <Dialog.Close asChild>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='absolute top-2 right-2 focus-visible:ring-0'>
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </Dialog.Close>
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    )}
                </AnimatePresence>
            </Dialog.Root>
        </>
    );
}