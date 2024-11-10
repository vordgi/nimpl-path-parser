const normalizePathname = (pathname: string) => {
    const cleanPathname = pathname && new URL(pathname, "http://n").pathname;
    const pathnameWithoutTrailingSlash = cleanPathname?.replace(/^(\/.*)\/$/, "$1");
    const pathnameWithoutFileType = pathnameWithoutTrailingSlash?.replace(/\/_not-found$/, "");
    return pathnameWithoutFileType.endsWith("/") ? pathnameWithoutFileType : pathnameWithoutFileType + "/";
};

const normalizePagePath = (pagePath: string) => {
    const cleanPagePath = pagePath && new URL(pagePath, "http://n").pathname;
    const pagePathWithoutFileType = cleanPagePath?.replace(/(\/page|\/_not-found)$/, "/");
    const pagePathWithoutGroups = pagePathWithoutFileType
        .split("/")
        .filter(Boolean)
        .filter((segment) => !segment.match(/^(\([^)]+\)$|^\@.+$)/g));

    if (pagePathWithoutGroups.length === 0) return "/";

    return "/" + pagePathWithoutGroups.join("/") + "/";
};

const parseSegments = (pagePathParts: string[], pathnameParts: string[]) => {
    const query = pagePathParts.reduce<{ [key: string]: string | string[] }>((acc, cur, index) => {
        const optionalCatchAllSegment = cur.match(/^\[\[\.\.\.([^\]]+)\]\]$/);
        if (optionalCatchAllSegment) {
            const key = optionalCatchAllSegment[1];
            const segmentParts = pathnameParts.slice(index);
            if (segmentParts.length) {
                acc[key] = segmentParts;
            }
            return acc;
        }

        const catchAllSegment = cur.match(/^\[\.\.\.([^\]]+)\]$/);
        if (catchAllSegment) {
            const key = catchAllSegment[1];
            acc[key] = pathnameParts.slice(index);
            return acc;
        }

        const dynamicSegment = cur.match(/^\[([^\]]+)\]$/);
        if (dynamicSegment) {
            const key = dynamicSegment[1];
            acc[key] = pathnameParts[index];
            return acc;
        }

        return acc;
    }, {});

    return query;
};

const normalizeInterceptingRoutes = (pageParts: string[]) => {
    let skip = 0;
    const normilizedParts: string[] = [];

    for (const pagepart of [...pageParts].reverse()) {
        if (skip) {
            skip -= 1;
            continue;
        }

        if (pagepart.startsWith("(...)")) {
            normilizedParts.push(pagepart.replace(/^\(\.\.\.\)/, ""));
            break;
        } else if (pagepart.startsWith("(.)")) {
            normilizedParts.push(pagepart.replace(/^\(\.\)/, ""));
        } else if (pagepart.startsWith("(..)")) {
            const skipLeafs = pagepart.match(/\(\.\.\)/g);
            skip += skipLeafs?.length || 0;
            normilizedParts.push(pagepart.replace(/^(\(\.\.\))+/, ""));
        } else {
            normilizedParts.push(pagepart);
        }
    }

    return normilizedParts.reverse();
};

const isSamePaths = (urlPathnameParts: string[], pagePathParts: string[]) => {
    for (let i = 0; i < pagePathParts.length; i++) {
        const urlPathnamePart = urlPathnameParts[i];
        const pagePathPart = pagePathParts[i];
        if (pagePathPart.match(/\[\.\.\.[^\]]+\]/)) return true;
        if (pagePathPart.match(/\[[^\]]+\]/)) continue;
        if (urlPathnamePart !== pagePathPart) return false;
    }
    return urlPathnameParts.length === pagePathParts.length;
};

export const parse = (pathname: string, rule: string) => {
    const cleanUrlPathname = normalizePathname(pathname);
    const cleanPagePath = normalizePagePath(rule);
    const pagePathParts = cleanPagePath.split("/").slice(0, -1);
    const pagePathInterceptedParts = normalizeInterceptingRoutes(pagePathParts);
    const pathnameParts = cleanUrlPathname.split("/").slice(0, -1);

    const isNotFoundPage = rule.match(/\/_not-found\/?$/);
    const isCorrectMatched = isNotFoundPage || isSamePaths(pathnameParts, pagePathInterceptedParts);

    if (!isCorrectMatched) {
        return null;
    }

    const query = parseSegments(pagePathInterceptedParts, pathnameParts);
    return query;
};
