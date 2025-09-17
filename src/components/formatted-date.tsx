export default function FormattedDate({ pDate }: { pDate: Date | string }) {
    return (
        <>
            {pDate &&
                new Date(pDate).toLocaleString(navigator.language, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })}
        </>
    );
}
