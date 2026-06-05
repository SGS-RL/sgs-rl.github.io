import Header from "./components/Header";
import VideoNarrative from "./components/VideoNarrative";
import Manipulation from "./components/Manipulation";
import Method from "./components/Method";
import Scaling from "./components/Scaling";
import RealWorld from "./components/RealWorld";
import SkipIntro from "./components/SkipIntro";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <SkipIntro />
      <VideoNarrative />
      <Manipulation />
      <Method />
      <Scaling />
      <RealWorld />
    </main>
  );
}
