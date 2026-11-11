import HL from './kernel';

export type HairlineFigure = {
  name: string;
  means: string;
  rules: number[];
  range: [number, number, number];
  tour: ([number, number] | null)[];
  mount: (
    host: {
      stage: HTMLElement;
      svg: SVGElement;
      read: { textContent: string | null };
    },
    value: number
  ) => { set: (value: number) => void; destroy: () => void };
};

declare const figure: HairlineFigure;
export default figure;
export { HL };
