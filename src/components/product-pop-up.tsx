import { Product } from '~/types/lessons';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { useState } from 'react';
import { BookText, Brain, Info } from 'lucide-react';

export default function ProductPopUp({ product }: { product: Product }) {
    const [open, setOpen] = useState<boolean>(true);

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className='lg:w-9/12 lg:max-w-2xl h-96' variant='no-darken'>
                <div className='text-center'>
                    <AlertDialogTitle className='mt-2 font-normal text-sm'>About the product</AlertDialogTitle>
                    <p className='font-medium text-2xl text-zinc-800'>
                        {product.title} ({product.category})
                    </p>
                    <div className='my-4 px-16 flex pt-2 text-left'>
                        <div className='aspect-square my-auto mr-4'>
                            <Info />
                        </div>
                        {product.category}
                    </div>
                    <div className='my-4 px-16 flex pt-2 text-left'>
                        <div className='aspect-square my-auto mr-4'>
                            <Brain />
                        </div>
                        {product.description}
                    </div>
                </div>
                <AlertDialogFooter className='mt-auto h-min'>
                    <AlertDialogAction
                        className='bg-brand hover:bg-brand-dark w-full'
                        onClick={() => setOpen(false)}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
