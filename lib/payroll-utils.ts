export const calculateNetSalary = (base: number, bonuses: number = 0, deductions: number = 0) => {
    return Math.max(0, base + bonuses - deductions);
};
