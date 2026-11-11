type Point = [number, number];

type HairlineKernel = {
  inject: (root: Document | ParentNode) => void;
  mk: (
    tag: string,
    attrs: Record<string, string> | null | undefined,
    parent?: ParentNode | null
  ) => SVGElement;
  tour: (
    stage: HTMLElement,
    stops: (Point | null)[] | null | undefined,
    onStop?: (i: number) => void
  ) => { stop: () => void };
  LAP: (Point | null)[];
};

declare const HL: HairlineKernel;
export default HL;
