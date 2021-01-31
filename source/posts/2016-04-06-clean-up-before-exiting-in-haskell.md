---
title: "Clean up before exiting in Haskell"
tags: [Haskell]
---

Once upon a time (or a several days ago), I was reading [Programming in Haskell](http://amzn.to/22Qe9zf). When I ran 9.7's Game of Life, which shows Game of Life animation on the terminal, the terminal's cursor was flickering and annoying. So I tried to hide it when starting and show when exiting.

```hs
import System.Process (system)

main :: IO ()
main = do
  -- Hide the cursor
  system "tput civis"
  -- Show the Game of Life
  life glider
  -- Show the cursor (but the code does not reach here!)
  system "tput cvvis"
  return ()

life :: Board -> IO ()
glider :: Board
```

But the code does not reach the line that shows the cursor because `life` is a infinite loop. If I quit the program with `Ctrl+C`, the cursor remains hidden.

So I wrote a function that loops `a -> IO a` until interrupted by a signal, referring to [unix - Killing a Haskell binary - Stack Overflow](http://stackoverflow.com/a/18430872/822317). It manages a state of whether the program was interrupted in a `MVar` and stops the loop when interrupted.

```hs
import Control.Concurrent.MVar (MVar, newEmptyMVar, putMVar, tryTakeMVar)
import System.Posix.Signals (Handler, Handler(CatchOnce), installHandler, sigINT, sigTERM)

loopUntilInterruption :: (a -> IO a) -> a -> IO ()
loopUntilInterruption p init = do
  v <- newEmptyMVar
  installHandler sigINT (handler v) Nothing
  installHandler sigTERM (handler v) Nothing
  loop v p init

handler :: MVar () -> Handler
handler v = CatchOnce $ putMVar v ()

loop :: MVar () -> (a -> IO a) -> a -> IO ()
loop v p prev = do
  x <- p prev
  val <- tryTakeMVar v
  case val of
    Just _ -> return ()
    Nothing -> loop v p x >> return ()
```

In the Game of Life, I changed the type of `life` so that it returns the result of its previous result and loop with `loop
`. Now the clean up code will be called when interrupted by a signal.

```hs
import System.Process (system)

main :: IO ()
main = do
  -- Hide the cursor
  system "tput civis"
  -- Loop until interrupted
  loopUntilInterruption life glider
  -- Show the cursor (the code will reach here now!)
  system "tput cvvis"
  return ()

life :: Board -> IO Board
glider :: Board
```

And they lived happily ever after.
