import React from "react";

/**
 * Local line-icon set. Replaces the Fluent icon package so the whole UI shares
 * one stroke weight and inherits `currentColor` instead of shipping two
 * competing visual languages.
 */
export type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-[1.15em] shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.5v-6.2h-5V21H5a1 1 0 0 1-1-1z" />
    </Icon>
  );
}

export function IconBuilding(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
      <path d="M14 10h5a1 1 0 0 1 1 1v10" />
      <path d="M3 21h18" />
      <path d="M7.5 7.5h3M7.5 11.5h3M7.5 15.5h3M17 14.5v3" />
    </Icon>
  );
}

export function IconUsers(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3.5 20a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.6a5.6 5.6 0 0 1 3 5.4" />
    </Icon>
  );
}

export function IconUser(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Icon>
  );
}

export function IconPlus(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconUpload(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 16V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 20h16" />
    </Icon>
  );
}

export function IconDownload(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 4v12" />
      <path d="M7.5 11.5 12 16l4.5-4.5" />
      <path d="M4 20h16" />
    </Icon>
  );
}

export function IconCopy(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M15 6V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H6" />
    </Icon>
  );
}

export function IconCheck(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </Icon>
  );
}

export function IconCheckCircle(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3 11 14.8l4.5-5" />
    </Icon>
  );
}

export function IconTrash(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l.9 13.1h9.2L17.5 7" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </Icon>
  );
}

export function IconPencil(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M5 19h3.4L20 7.4a2.4 2.4 0 0 0-3.4-3.4L5 15.6z" />
      <path d="M15.5 5.5 18.5 8.5" />
    </Icon>
  );
}

export function IconEye(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function IconEyeOff(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 4l16 16" />
      <path d="M9.8 6.2A9.7 9.7 0 0 1 12 5.9c6 0 9.5 6.1 9.5 6.1a17.4 17.4 0 0 1-3 3.9" />
      <path d="M6.8 8.2A17.2 17.2 0 0 0 2.5 12S6 18.1 12 18.1a10 10 0 0 0 3-.45" />
      <path d="M10 10.2a2.6 2.6 0 0 0 3.7 3.6" />
    </Icon>
  );
}

export function IconSearch(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M15.6 15.6 20.5 20.5" />
    </Icon>
  );
}

export function IconArrowRight(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </Icon>
  );
}

export function IconArrowLeft(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15" />
      <path d="M10.5 6l-6 6 6 6" />
    </Icon>
  );
}

export function IconKey(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="8" cy="15.5" r="3.8" />
      <path d="M10.8 12.8 20 3.6" />
      <path d="M16.4 7.2l2.3 2.3M18.6 5l2.3 2.3" />
    </Icon>
  );
}

export function IconApi(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M9.5 4C7 4 7.6 9.2 5 12c2.6 2.8 2 8 4.5 8" />
      <path d="M14.5 4c2.5 0 1.9 5.2 4.5 8-2.6 2.8-2 8-4.5 8" />
    </Icon>
  );
}

export function IconSun(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.2M12 19v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.8 12h2.2M19 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </Icon>
  );
}

export function IconMoon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M20.2 14.8A8.6 8.6 0 0 1 9.2 3.8a8.6 8.6 0 1 0 11 11z" />
    </Icon>
  );
}

export function IconMonitor(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M9 20h6" />
      <path d="M12 16.5V20" />
    </Icon>
  );
}

export function IconMenu(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function IconClose(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconSignOut(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M14 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M10.5 12h9" />
      <path d="M16.5 8.5l3 3.5-3 3.5" />
    </Icon>
  );
}

export function IconShield(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 3.2l7.5 2.6v6c0 4.8-3.2 7.9-7.5 9-4.3-1.1-7.5-4.2-7.5-9v-6z" />
      <path d="M9.2 11.8 11.4 14l3.6-4" />
    </Icon>
  );
}

export function IconAlert(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 4.2 21 20H3z" />
      <path d="M12 10v4.2" />
      <path d="M12 17.2h.01" />
    </Icon>
  );
}

export function IconInfo(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Icon>
  );
}

export function IconTable(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M9.5 9.5v10" />
    </Icon>
  );
}
