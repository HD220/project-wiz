import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


function RepositoryMetric({ label, value, progress, icon }) {
  return (
    {repositoryMetrics.map((metric, index) => (
  <RepositoryMetric
    key={index}
    label={metric.label}
    value={metric.value}
    progress={metric.progress}
    icon={metric.icon}
  />
))}
                  <span>5 active</span>
                </div>
                <Progress value={50} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
