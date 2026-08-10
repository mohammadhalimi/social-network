import { Congrat } from "./svg/congrat";

export const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
    <button
        type="submit"
        disabled={isSubmitting}
        className="
        btn-primary
        w-full
        text-center
        flex
        items-center
        justify-center
        gap-2
    ">
        {isSubmitting ? (
            <>
                <Congrat />
                در حال ثبت‌نام...
            </>
        ) : (
            'ثبت‌نام 🎉'
        )}
    </button>
);