import { navItems } from "@/components/navigation/nav-items";

export function Sidebar() {
  return (
    <aside>
      <h2>
        Astra
      </h2>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
