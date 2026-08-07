export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-black text-white -mx-2 sm:-mx-6 -my-8 px-6 md:px-16 py-12 md:py-20 flex flex-col items-center">
            <div className="max-w-3xl w-full">
                <h1 className="font-['Bebas_Neue'] text-4xl md:text-6xl font-bold mb-8 text-left border-b border-white/10 pb-4">
                    <span className="text-red-600">REFUND</span> POLICY
                </h1>
                <div className="font-['Space_Grotesk'] flex flex-col gap-6 text-base md:text-lg leading-relaxed text-gray-300">
                    <p>
                        All purchases made from <strong className="text-white">TEDxIIT Patna</strong>, including event tickets and merchandise, are final. Once a purchase has been made, it cannot be cancelled, refunded, exchanged, or returned under any circumstances.
                    </p>
                    <p>
                        No requests for refunds or cancellations of tickets will be entertained, including but not limited to inability to attend the event due to personal reasons, travel disruptions, medical emergencies, or unforeseen circumstances. Similarly, no requests for the return, exchange, or refund of merchandise will be accepted due to change of mind, personal preference, or any other reason.
                    </p>
                    <p className="font-medium text-white pt-2">
                        By purchasing a ticket or merchandise item, the buyer acknowledges and agrees to abide by this Refund Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}