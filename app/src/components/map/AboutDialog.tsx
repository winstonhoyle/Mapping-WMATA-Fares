import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { ExternalLink } from "@/components/common/ExternalLink";
import styles from "./AboutDialog.module.css";

type AboutDialogProps = { open: boolean; onClose: () => void };

export const AboutDialog = ({ open, onClose }: AboutDialogProps) => (
  <Dialog open={open} onClose={onClose} label="About WMATA Fares">
    <div className={styles.content}>
      <img src="/logo-mark.svg" alt="" width={64} height={64} />
      <h2 className={styles.title}>About WMATA Fares</h2>
      <p>
        Metrorail fares depend on the distance between two stations and the time of day. Pick a
        station to see what a trip from it costs to every other station.
      </p>
      <p>
        Peak fares apply on weekday rush hours. WMATA lists the current hours and passes on its{" "}
        <ExternalLink href="https://www.wmata.com/fares/">fares page</ExternalLink>.
      </p>
      <p>
        Not affiliated with WMATA. Read the code on{" "}
        <ExternalLink href="https://github.com/winstonhoyle/Mapping-WMATA-Fares">
          GitHub
        </ExternalLink>
        .
      </p>
      <Button onClick={onClose} data-autofocus>
        Close
      </Button>
    </div>
  </Dialog>
);
