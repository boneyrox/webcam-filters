import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export const Button: React.FC<ButtonProps> = ({ variant = "default", className = "", children, ...props }) => {
  const baseClasses =
    "rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variantClasses = {
    default: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  }

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <button {...props} className={combinedClasses}>
      {children}
    </button>
  )
}

