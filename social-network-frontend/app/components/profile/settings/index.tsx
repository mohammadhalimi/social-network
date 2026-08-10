import { ChangeTheme } from "./ChangeTheme";

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
      <ChangeTheme />
    </div>
  );
}