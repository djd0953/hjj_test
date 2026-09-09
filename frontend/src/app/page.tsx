import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function HomePage()
{
    return (
        <main className="page-content flex flex-col gap-6">
            <PageHeader
                description="Spring API 학습과 작은 실험을 위한 개인 Playground입니다."
                eyebrow="HJJ PLAYGROUND"
                title="오늘은 무엇을 만들어 볼까요?"
            />
            <div className="ui-home-grid">
                <Card className="ui-home-card">
                    <p className="ui-eyebrow">CODE</p>
                    <h2 className="ui-card-title">API 스니펫을 실행해 보세요</h2>
                    <p className="ui-empty-message">Spring API가 제공하는 Code를 바로 확인하고 결과를 살펴볼 수 있어요.</p>
                </Card>
                <Card className="ui-home-card ui-home-card-accent">
                    <p className="ui-eyebrow">GAMES</p>
                    <h2 className="ui-card-title">잠깐의 리프레시</h2>
                    <p className="ui-empty-message">Canvas, Pixi, Three로 만든 게임을 골라 가볍게 즐겨 보세요.</p>
                </Card>
            </div>
        </main>
    );
}
