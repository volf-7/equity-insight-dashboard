interface Props {
  text: string;
}

const ChartDescription = ({ text }: Props) => (
  <p className="text-[11px] text-muted-foreground leading-relaxed mt-3 px-1 max-w-4xl">
    {text}
  </p>
);

export default ChartDescription;
