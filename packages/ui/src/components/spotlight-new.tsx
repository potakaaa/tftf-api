import { cn } from "@workspace/ui/lib/utils"

type SpotlightProps = {
  className?: string
  fill?: string
}

function Spotlight({ className, fill = "var(--primary)" }: SpotlightProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-70",
        className
      )}
    >
      <div
        className="animate-spotlight absolute -top-[28rem] left-[-17rem] h-[84rem] w-[35rem] rotate-[24deg] rounded-[100%] blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, color-mix(in oklch, ${fill} 22%, transparent) 0%, color-mix(in oklch, ${fill} 8%, transparent) 42%, transparent 72%)`,
        }}
      />
      <div
        className="animate-spotlight absolute -top-[34rem] right-[-20rem] h-[88rem] w-[38rem] -rotate-[18deg] rounded-[100%] blur-3xl [animation-delay:900ms]"
        style={{
          background: `radial-gradient(ellipse at center, color-mix(in oklch, ${fill} 16%, transparent) 0%, color-mix(in oklch, ${fill} 5%, transparent) 48%, transparent 74%)`,
        }}
      />
    </div>
  )
}

export { Spotlight }
