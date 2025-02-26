export default function PatternBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100" />
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div
        className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 blur-[100px]"
        aria-hidden="true"
      />
    </div>
  )
}
