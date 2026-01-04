
import Navbar from "@/components/Navbar";
import VideoUploader from "@/components/VideoUploader";

export default function Upload() {
  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Upload Video</h1>
          <VideoUploader />
        </div>
      </main>
    </div>
  );
}
