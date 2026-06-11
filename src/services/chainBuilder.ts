import type {
  BugMatchResult,
  BugChain,
  ChainNode,
  ChainEdge,
  CognitiveBug,
  PropagationPath,
} from "../types/bug";
import type { PersonalityProfile } from "../types/personality";
import {
  generatePersonalityAugmentedExplanation,
  mergePersonalityIntoExplanation,
} from "./personalityService";

export function buildBugChain(
  matchResults: BugMatchResult[],
  allBugs: CognitiveBug[],
  personalityProfile?: PersonalityProfile
): BugChain | null {
  if (matchResults.length === 0) return null;

  const bugMap = new Map<string, CognitiveBug>();
  allBugs.forEach((bug) => bugMap.set(bug.id, bug));

  const matchMap = new Map<string, BugMatchResult>();
  matchResults.forEach((result) => matchMap.set(result.bug.id, result));

  const matchedBugIds = new Set(matchResults.map((r) => r.bug.id));

  const triggerBugId = findTriggerBug(matchResults, allBugs);

  const nodes: ChainNode[] = [];
  const edges: ChainEdge[] = [];
  const visited = new Set<string>();

  const queue: { bugId: string; level: number; isMatched: boolean; accumulatedStrength: number }[] = [
    { bugId: triggerBugId, level: 0, isMatched: true, accumulatedStrength: 1.0 },
  ];

  while (queue.length > 0) {
    const { bugId, level, isMatched, accumulatedStrength } = queue.shift()!;

    if (visited.has(bugId)) continue;
    visited.add(bugId);

    const bug = bugMap.get(bugId);
    if (!bug) continue;

    const matchResult = matchMap.get(bugId);
    const matchScore = matchResult?.matchScore ?? 0;

    nodes.push({
      bugId,
      bug,
      matchScore,
      isTrigger: bugId === triggerBugId,
      level,
      isMatched,
      propagationStrength: accumulatedStrength,
    });

    if (bug.triggers && bug.triggers.length > 0) {
      for (const propagation of bug.triggers) {
        const targetBug = bugMap.get(propagation.targetId);
        if (!targetBug) continue;

        const targetIsMatched = matchedBugIds.has(propagation.targetId);
        const nextStrength = accumulatedStrength * propagation.strength;

        if (targetIsMatched) {
          edges.push({
            from: bugId,
            to: propagation.targetId,
            reason: propagation.reason,
            strength: propagation.strength,
            type: "matched",
          });

          if (!visited.has(propagation.targetId)) {
            queue.push({
              bugId: propagation.targetId,
              level: level + 1,
              isMatched: true,
              accumulatedStrength: nextStrength,
            });
          }
        } else if (isMatched && nextStrength > 0.4 && level < 3) {
          edges.push({
            from: bugId,
            to: propagation.targetId,
            reason: propagation.reason,
            strength: propagation.strength,
            type: "potential",
          });

          if (!visited.has(propagation.targetId)) {
            queue.push({
              bugId: propagation.targetId,
              level: level + 1,
              isMatched: false,
              accumulatedStrength: nextStrength,
            });
          }
        }
      }
    }
  }

  nodes.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    if (a.isMatched !== b.isMatched) return a.isMatched ? -1 : 1;
    return b.propagationStrength - a.propagationStrength;
  });

  const dominantPath = findDominantPath(triggerBugId, nodes, edges, bugMap);
  let explanation = generateExplanation(
    nodes,
    edges,
    triggerBugId,
    dominantPath,
    bugMap
  );

  let personalityAugmented = undefined;
  if (personalityProfile) {
    personalityAugmented = generatePersonalityAugmentedExplanation(
      { nodes, edges, triggerBugId, chainLength: 0, potentialCount: 0, explanation, dominantPath, spiralSeverity: "mild" },
      personalityProfile,
      allBugs
    );
    explanation = mergePersonalityIntoExplanation(explanation, personalityAugmented);
  }

  const matchedCount = nodes.filter((n) => n.isMatched).length;
  const potentialCount = nodes.filter((n) => !n.isMatched).length;

  return {
    nodes,
    edges,
    triggerBugId,
    chainLength: matchedCount,
    potentialCount,
    explanation,
    dominantPath,
    spiralSeverity: calculateSpiralSeverity(nodes, edges),
    personalityProfile,
    personalityAugmented,
  };
}

function findTriggerBug(
  matchResults: BugMatchResult[],
  allBugs: CognitiveBug[]
): string {
  if (matchResults.length === 1) {
    return matchResults[0].bug.id;
  }

  const bugMap = new Map<string, CognitiveBug>();
  allBugs.forEach((bug) => bugMap.set(bug.id, bug));

  const inDegree = new Map<string, number>();
  matchResults.forEach((r) => inDegree.set(r.bug.id, 0));

  const matchedIds = new Set(matchResults.map((r) => r.bug.id));

  for (const result of matchResults) {
    const bug = result.bug;
    if (bug.triggers) {
      for (const propagation of bug.triggers) {
        if (matchedIds.has(propagation.targetId)) {
          const current = inDegree.get(propagation.targetId) ?? 0;
          inDegree.set(propagation.targetId, current + propagation.strength);
        }
      }
    }
  }

  let minDegree = Infinity;
  let triggerCandidates: string[] = [];

  for (const [bugId, degree] of inDegree.entries()) {
    if (degree < minDegree) {
      minDegree = degree;
      triggerCandidates = [bugId];
    } else if (Math.abs(degree - minDegree) < 0.01) {
      triggerCandidates.push(bugId);
    }
  }

  if (triggerCandidates.length === 1) {
    return triggerCandidates[0];
  }

  let maxScore = -1;
  let triggerId = triggerCandidates[0];

  for (const bugId of triggerCandidates) {
    const result = matchResults.find((r) => r.bug.id === bugId);
    if (result && result.matchScore > maxScore) {
      maxScore = result.matchScore;
      triggerId = bugId;
    }
  }

  return triggerId;
}

function findDominantPath(
  triggerBugId: string,
  nodes: ChainNode[],
  edges: ChainEdge[],
  bugMap: Map<string, CognitiveBug>
): PropagationPath | null {
  const nodeMap = new Map<string, ChainNode>();
  nodes.forEach((n) => nodeMap.set(n.bugId, n));

  const adjacencyList = new Map<string, ChainEdge[]>();
  edges.forEach((e) => {
    if (!adjacencyList.has(e.from)) {
      adjacencyList.set(e.from, []);
    }
    adjacencyList.get(e.from)!.push(e);
  });

  let bestPath: string[] = [];
  let bestStrength = 0;

  function dfs(currentId: string, path: string[], strength: number, visited: Set<string>) {
    if (strength > bestStrength && path.length > 1) {
      bestStrength = strength;
      bestPath = [...path];
    }

    const outgoing = adjacencyList.get(currentId) ?? [];
    for (const edge of outgoing) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      path.push(edge.to);
      dfs(edge.to, path, strength * edge.strength, visited);
      path.pop();
      visited.delete(edge.to);
    }
  }

  const visited = new Set<string>([triggerBugId]);
  dfs(triggerBugId, [triggerBugId], 1.0, visited);

  if (bestPath.length < 2) return null;

  const pathNodes = bestPath
    .map((id) => nodeMap.get(id))
    .filter((n): n is ChainNode => n !== undefined);

  const pathEdges: ChainEdge[] = [];
  for (let i = 0; i < bestPath.length - 1; i++) {
    const edge = edges.find((e) => e.from === bestPath[i] && e.to === bestPath[i + 1]);
    if (edge) pathEdges.push(edge);
  }

  return {
    bugIds: bestPath,
    nodes: pathNodes,
    edges: pathEdges,
    totalStrength: bestStrength,
  };
}

function calculateSpiralSeverity(
  nodes: ChainNode[],
  edges: ChainEdge[]
): "mild" | "moderate" | "severe" {
  const matchedCount = nodes.filter((n) => n.isMatched).length;
  const potentialCount = nodes.filter((n) => !n.isMatched).length;
  const totalEdges = edges.length;

  if (matchedCount >= 5 || (matchedCount >= 3 && potentialCount >= 3)) {
    return "severe";
  }
  if (matchedCount >= 3 || (matchedCount >= 2 && potentialCount >= 2)) {
    return "moderate";
  }
  return "mild";
}

function generateExplanation(
  nodes: ChainNode[],
  edges: ChainEdge[],
  triggerBugId: string,
  dominantPath: PropagationPath | null,
  bugMap: Map<string, CognitiveBug>
): string {
  if (nodes.length === 0) return "";

  const triggerBug = bugMap.get(triggerBugId);
  if (!triggerBug) return "";

  const matchedNodes = nodes.filter((n) => n.isMatched);
  const potentialNodes = nodes.filter((n) => !n.isMatched);

  if (matchedNodes.length === 1 && potentialNodes.length === 0) {
    return `你的想法主要触发了「${triggerBug.name}」。虽然目前只检测到这一个认知 Bug，但它可能是一个起点，如果不加以觉察，可能会引发更多的思维偏差。

认知 Bug 之所以会形成连锁反应，是因为每一种偏差都会改变你看待世界的方式——你的注意力会被引导到特定的方向，你的情绪会被放大或扭曲，而这些变化又会成为下一个偏差的土壤。这就是为什么人会越想越糟：不是因为事情本身在变坏，而是因为你的思维模式在不断向下螺旋。

好消息是，只要在链条的任何一环打断它，整个螺旋就会停下来。觉察就是打断的第一步。`;
  }

  let explanation = "";

  if (dominantPath && dominantPath.nodes.length >= 3) {
    const pathNames = dominantPath.nodes
      .map((n) => n.isMatched ? `「${n.bug.name}」` : `「${n.bug.name}」⚠️`)
      .join(" → ");

    explanation = `你的脑内故障链从「${triggerBug.name}」开始，\n沿着 ${pathNames} 的路径不断向下蔓延。\n（标注 ⚠️ 的是尚未被明确触发但高度易感的节点）\n\n`;
  } else {
    const matchedNames = matchedNodes.map((n) => n.bug.name).join("、");
    explanation = `你的想法触发了 ${matchedNodes.length} 个认知 Bug：${matchedNames}。\n它们不是孤立存在的，而是互相触发、互相加强，形成了一个向下的思维螺旋。\n\n`;
  }

  explanation += `【为什么会越想越糟？——向下螺旋的运作机制】\n\n`;

  explanation += `认知 Bug 不是单独出现的，它们像多米诺骨牌一样连锁反应。每一个偏差都会为下一个偏差创造条件：\n\n`;

  const edgeMap = new Map<string, ChainEdge>();
  edges.forEach((e) => edgeMap.set(`${e.from}-${e.to}`, e));

  if (dominantPath && dominantPath.nodes.length >= 2) {
    for (let i = 0; i < dominantPath.nodes.length - 1; i++) {
      const fromNode = dominantPath.nodes[i];
      const toNode = dominantPath.nodes[i + 1];
      const edge = dominantPath.edges[i];
      if (!edge) continue;

      const potentialMark = edge.type === "potential" ? "  ⚠️（高风险传播）" : "";
      explanation += `${i + 1}. 「${fromNode.bug.name}」 → 「${toNode.bug.name}」${potentialMark}\n`;
      explanation += `   → ${edge.reason}（强度 ${Math.round(edge.strength * 100)}%）\n\n`;
    }
  } else {
    const matchedEdges = edges.filter((e) => e.type === "matched");
    const levelMap = new Map<number, ChainNode[]>();
    nodes.forEach((node) => {
      if (!levelMap.has(node.level)) {
        levelMap.set(node.level, []);
      }
      levelMap.get(node.level)!.push(node);
    });

    const levelKeys = Array.from(levelMap.keys()).sort((a, b) => a - b);

    let step = 1;
    for (let i = 0; i < levelKeys.length - 1; i++) {
      const currentLevel = levelMap.get(levelKeys[i])!;
      const nextLevel = levelMap.get(levelKeys[i + 1])!;

      for (const fromNode of currentLevel) {
        if (!fromNode.isMatched) continue;
        for (const toNode of nextLevel) {
          const edge = matchedEdges.find(
            (e) => e.from === fromNode.bugId && e.to === toNode.bugId
          );
          if (edge) {
            explanation += `${step}. 「${fromNode.bug.name}」 → 「${toNode.bug.name}」\n   → ${edge.reason}\n\n`;
            step++;
          }
        }
      }
    }
  }

  explanation += `【向下螺旋的三层放大机制】\n\n`;

  explanation += `第一层：注意力偏差\n当你有了「${triggerBug.name}」的倾向，你的注意力就会自动偏向那些支持这个想法的证据，忽略相反的信息。比如「负面像素锁定」会让你只盯着坏事看，而「比较地狱」会让你只看到别人的高光时刻。注意力的选择性聚焦，会让偏差看起来越来越"真实"。\n\n`;

  explanation += `第二层：情绪强化\n认知偏差会引发负面情绪，而负面情绪又会反过来强化偏差。比如「感受即事实」——你感到焦虑，就觉得一定有危险；你感到低落，就觉得自己真的很差。情绪和想法形成了一个正反馈循环，越转越快。\n\n`;

  explanation += `第三层：行为固化\n当偏差积累到一定程度，就会影响你的行为。比如「拖延瘫痪」——因为觉得做不好所以不做，因为不做所以更觉得自己做不好。行为的结果又"印证"了最初的偏差想法，形成了一个自我实现的预言闭环。\n\n`;

  if (potentialNodes.length > 0) {
    const potentialNames = potentialNodes
      .slice(0, 3)
      .map((n) => `「${n.bug.name}」`)
      .join("、");

    explanation += `【你的下一个可能】\n\n`;
    explanation += `如果任由这个螺旋继续，你可能还会感受到 ${potentialNames}。\n这些是认知 Bug 链路上常见的"下一站"，但它们不是必然会发生的——\n只要你现在觉察到了这个螺旋的存在，就有机会在它继续向下之前打断它。\n\n`;
  }

  explanation += `【如何打断这个螺旋？】\n\n`;
  explanation += `好消息是，向下螺旋不是不可逆的。你可以在任何一环打断它：\n\n`;
  explanation += `• 在注意力层：刻意寻找反面证据，问问自己"有没有其他可能？"\n`;
  explanation += `• 在情绪层：给情绪贴标签而不是被情绪带走——"我现在有焦虑的感受"不等于"有危险"\n`;
  explanation += `• 在行为层：用微小的行动打破惯性——五分钟启动法，做了就好，不用完美\n\n`;

  explanation += `记住：看见螺旋，就已经走出了螺旋的第一步。`;

  return explanation;
}

export function getAllPropagationPaths(
  bugId: string,
  allBugs: CognitiveBug[],
  maxDepth: number = 3
): string[][] {
  const bugMap = new Map<string, CognitiveBug>();
  allBugs.forEach((bug) => bugMap.set(bug.id, bug));

  const paths: string[][] = [];
  const visited = new Set<string>();

  function dfs(currentId: string, path: string[], depth: number) {
    if (depth > maxDepth) return;

    const bug = bugMap.get(currentId);
    if (!bug || !bug.triggers) return;

    for (const propagation of bug.triggers) {
      if (visited.has(propagation.targetId)) continue;

      const newPath = [...path, propagation.targetId];
      paths.push(newPath);

      visited.add(propagation.targetId);
      dfs(propagation.targetId, newPath, depth + 1);
      visited.delete(propagation.targetId);
    }
  }

  dfs(bugId, [bugId], 0);
  return paths;
}
