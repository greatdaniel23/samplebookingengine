import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:        'bg-samudra-paper border border-samudra-paper-deep text-samudra-ink font-body text-[13px] shadow-[0_8px_32px_rgba(31,27,23,0.28)]',
          title:        'font-display text-[16px] font-normal text-samudra-ink',
          description:  'font-body text-[12px] text-samudra-ink-mute mt-1',
          actionButton: 'bg-samudra-ink text-samudra-paper text-[10px] tracking-[0.3em] uppercase px-3 h-8',
          cancelButton: 'bg-samudra-paper text-samudra-ink border border-samudra-ink text-[10px] tracking-[0.3em] uppercase px-3 h-8',
          success:      'border-l-2 border-l-samudra-teal',
          error:        'border-l-2 border-l-[#7a3d31]',
          info:         'border-l-2 border-l-samudra-gold',
          warning:      'border-l-2 border-l-samudra-sand',
        },
        duration: 5000,
      }}
      {...props}
    />
  );
};

export { Toaster };
