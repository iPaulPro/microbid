"use client";

import Link from "next/link";
import { SVGProps } from "react";
import { GavelIcon, UserIcon } from "lucide-react";
import FeaturedAuction from "@/components/FeaturedAuction";
import Countdown from "react-countdown";
import { useUser } from "@account-kit/react";

export default function Home() {
  const user = useUser();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          href="#"
          className="flex items-center justify-center gap-2"
          prefetch={false}
        >
          <GavelIcon className="h-6 w-6" />
          <span className="font-bold text-primary">Microbid</span>
        </Link>
        {user?.address ? (
          <Link
            href="/profile"
            className="ml-auto text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            <UserIcon className="w-6 h-6 overflow-hidden" />
          </Link>
        ) : (
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              How it Works
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Join Now
            </Link>
          </nav>
        )}
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Provably fair penny auctions
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Experience the thrill of{" "}
                    <span className="font-bold">100% onchain</span> penny
                    auctions with the security and transparency of blockchain
                    technology. Bid with confidence, knowing every participant
                    is a real person.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/profile"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Join Now
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    How it Works
                  </Link>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="opacity-80">Powered by</span>
                  <img
                    src="/images/base.svg"
                    alt="Base"
                    title="Base"
                    className="w-8 h-8"
                  />
                  <img
                    src="/images/worldcoin.svg"
                    alt="Worldcoin"
                    title="Worldcoin"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <div className="bg-muted rounded-xl p-6 flex flex-col gap-4">
                <div className="bg-background rounded-xl p-4 flex flex-col gap-2">
                  <FeaturedAuction itemId={1n} />
                </div>
                <div className="bg-background rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">Upcoming Auctions</div>
                    <Link
                      href="#"
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      prefetch={false}
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Nintendo Switch</div>
                      <div className="text-sm font-medium">
                        <Countdown date={Date.now() + 3600000} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Bose Headphones</div>
                      <div className="text-sm font-medium">
                        <Countdown date={Date.now() + 9000000} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Instant Pot</div>
                      <div className="text-sm font-medium">
                        <Countdown date={Date.now() + 14200000} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          id="how-it-works"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  How it Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Proof of Personhood
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our penny auctions are powered by blockchain technology,
                  ensuring every participant is a real person verified through
                  World ID. Bid with confidence, knowing the process is
                  transparent and fair.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">
                        Verified Participants
                      </h3>
                      <p className="text-muted-foreground">
                        Every user is verified as a real person through World ID
                        by Worldcoin, eliminating bots and fake accounts.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Secure Transactions</h3>
                      <p className="text-muted-foreground">
                        All transactions are recorded on Base L2, providing an
                        immutable and secure record of every auction.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Provably Fair</h3>
                      <p className="text-muted-foreground">
                        Microbid auctions are powered by smart contracts,
                        ensuring that every bid and outcome is verifiable and
                        transparent.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <img
                src="/images/world-id@2x.webp"
                width="550"
                height="310"
                alt="World ID Proof of Personhood"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Penny Auctions Made Simple
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Learn how our penny auction platform works and start bidding
                  on amazing products at unbelievable prices.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="bg-muted/50 rounded-md p-4 flex flex-col items-center justify-center">
                <GavelIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold mt-2">Register</h3>
                <p className="text-sm text-muted-foreground pt-2 text-center">
                  Sign up for a free account and start bidding.
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 flex flex-col items-center justify-center">
                <CoinsIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold mt-2">Buy Bids</h3>
                <p className="text-sm text-muted-foreground pt-2 text-center">
                  Purchase bid packages to use in our auctions.
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 flex flex-col items-center justify-center">
                <CheckIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold mt-2">Win Auctions</h3>
                <p className="text-sm text-muted-foreground pt-2 text-center">
                  Place your bids and win amazing products at penny prices.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Join the Penny Auction Revolution
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Experience the thrill of penny auctions with the security and
                transparency of blockchain technology. Sign up today and start
                bidding!
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Link
                href="/profile"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-12 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Join Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted p-6 md:py-12 w-full">
        <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 text-sm">
          <div className="grid gap-1 justify-center">
            <h3 className="font-semibold">Company</h3>
            <Link href="#" prefetch={false}>
              About Us
            </Link>
            <Link href="#" prefetch={false}>
              Our Team
            </Link>
            <Link href="#" prefetch={false}>
              Careers
            </Link>
            <Link href="#" prefetch={false}>
              News
            </Link>
          </div>
          <div className="grid gap-1 justify-center">
            <h3 className="font-semibold">Auctions</h3>
            <Link href="#" prefetch={false}>
              Current Auctions
            </Link>
            <Link href="#" prefetch={false}>
              Upcoming Auctions
            </Link>
            <Link href="#" prefetch={false}>
              Auction Results
            </Link>
            <Link href="#" prefetch={false}>
              Auction FAQs
            </Link>
          </div>
          <div className="grid gap-1 justify-center">
            <h3 className="font-semibold">Resources</h3>
            <Link href="#" prefetch={false}>
              Blog
            </Link>
            <Link href="#" prefetch={false}>
              Community
            </Link>
            <Link href="#" prefetch={false}>
              Support
            </Link>
            <Link href="#" prefetch={false}>
              Documentation
            </Link>
          </div>
          <div className="grid gap-1 justify-center">
            <h3 className="font-semibold">Legal</h3>
            <Link href="#" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="#" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" prefetch={false}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BitcoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CoinsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
