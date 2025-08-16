'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '~/components/ui/input-otp';
import { useEffect, useState } from 'react';
import { createClient } from '~/utils/supabase/client';
import { toast } from 'sonner';
import { redirect, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [value, setValue] = useState('');
    if (!email) {
        console.log('No email found');
        redirect('/login');
    }

    useEffect(() => {
        const verifyOTP = async () => {
            if (value.length === 6) {
                const { data, error } = await supabase.auth.verifyOtp({
                    email: decodeURIComponent(email!),
                    token: value,
                    type: 'email',
                });
                if (error) {
                    setValue('');
                    toast.error(
                        'There was an error during the login process. Please try again.',
                    );
                } else {
                    redirect('/dashboard');
                }
            }
        };
        verifyOTP();
    }, [value, email, supabase]);

    return (
        <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
            <div className='w-full max-w-sm md:max-w-xl'>
                <Card className='overflow-hidden'>
                    <CardContent className='p-6'>
                        <a
                            href='/login'
                            className='flex items-center justify-start gap-2 text-sm text-muted-foreground mb-8'>
                            <ArrowLeftIcon className='w-4 h-4' />
                            Back to login
                        </a>
                        <h2 className='mb-2 text-center text-base'>
                            Enter the code we sent to your email{' '}
                            <span className='font-mono'>
                                {decodeURIComponent(email!)}
                            </span>
                        </h2>
                        <div className='mb-12 w-min mx-auto'>
                            <InputOTP
                                maxLength={6}
                                value={value}
                                onChange={(value) => setValue(value)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
