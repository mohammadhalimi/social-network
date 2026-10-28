import { ChangeTheme } from "./ChangeTheme";
import { PrivacyToggle } from "./PrivacyToggle";

export default function Settings() {


  return (
    <div
      data-testid="settings-component"
      className="
      bg-card
      border
      border-border
      rounded-2xl
      p-6
      shadow-soft
    ">
      <h1
        className="
        text-xl
        sm:text-2xl
        font-bold
        text-primary
        mb-1
      ">
        ⚙️ تنظیمات
      </h1>
      <p
        className="
        text-sm
        text-secondar
        mb-6
       ">
        ظاهر و تنظیمات برنامه را مدیریت کنید
      </p>

      <div
        className="
        space-y-4
      ">
        <h1
          className="
          text-sm
          font-bold
          text-primary
          mb-3
        ">
          حریم خصوصی
        </h1>
        <PrivacyToggle />
      </div>
      <div
        className="
        space-y-4
        mt-6
      ">
        <h1
          className="
          text-sm
          font-bold
          text-primary
          mb-3
        ">
          ظاهر
        </h1>
        <ChangeTheme />
      </div>
    </div>
  );
}