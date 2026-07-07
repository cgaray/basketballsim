import { YearSelector } from 'basketball';

export function SeasonPicker() {
  return (
    <div className="w-56">
      <YearSelector
        availableYears={[2020, 2021, 2022, 2023, 2024]}
        selectedYear={2022}
        bestYear={2024}
        onYearChange={() => {}}
      />
    </div>
  );
}

export function PeakSeason() {
  return (
    <div className="w-56">
      <YearSelector
        availableYears={[2020, 2021, 2022, 2023, 2024]}
        selectedYear={2024}
        bestYear={2024}
        onYearChange={() => {}}
      />
    </div>
  );
}
